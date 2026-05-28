import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { JwtPayload, Rol, TokenPair, Usuario } from '../models/usuario.model';

const ACCESS_KEY = 'simulador.access';
const REFRESH_KEY = 'simulador.refresh';
const USER_KEY = 'simulador.user';

/** Respuesta del backend para login/registro: tokens + usuario. */
interface AuthResponse extends TokenPair {
  usuario: Usuario;
}

/** Datos para el registro autónomo de un docente. */
export interface RegistroDocenteData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Usuario actualmente autenticado (signal reactiva). null si no hay sesión. */
  private readonly _usuario = signal<Usuario | null>(this.loadUserFromStorage());
  readonly usuario = this._usuario.asReadonly();

  /** True si hay un access token guardado y no está expirado. */
  readonly isAuthenticated = computed(() => {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired(token);
  });

  /** Rol del usuario actual (null si no hay sesión). */
  readonly rol = computed(() => this._usuario()?.rol ?? null);

  // ---------- Login docente/administrador (username + password) ----------

  loginDocente(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/token/`, { username, password })
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  // ---------- Registro autónomo de docente ----------

  registroDocente(data: RegistroDocenteData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/registro-docente/`, data)
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  // ---------- Acceso estudiante (correo + código) — backend pendiente ----------

  loginEstudiante(correo: string, codigo: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/estudiante-acceso/`, { correo, codigo })
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  // ---------- Logout ----------

  logout(): Observable<unknown> {
    const refresh = this.getRefreshToken();
    const request$ = refresh
      ? this.http
          .post(`${environment.apiUrl}/auth/logout/`, { refresh })
          .pipe(catchError(() => of(null))) // si falla en el backend, igual hacemos logout local
      : of(null);

    return request$.pipe(
      tap(() => {
        this.clearLocalSession();
        this.router.navigate(['/auth/login']);
      }),
    );
  }

  /** Limpia tokens y usuario en memoria/storage sin llamar al backend. */
  clearLocalSession(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
  }

  // ---------- Tokens ----------

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  refreshAccessToken(): Observable<{ access: string; refresh?: string }> {
    const refresh = this.getRefreshToken();
    return this.http
      .post<{ access: string; refresh?: string }>(
        `${environment.apiUrl}/auth/token/refresh/`,
        { refresh },
      )
      .pipe(
        tap((res) => {
          localStorage.setItem(ACCESS_KEY, res.access);
          if (res.refresh) {
            // Con ROTATE_REFRESH_TOKENS=True el backend rota el refresh.
            localStorage.setItem(REFRESH_KEY, res.refresh);
          }
        }),
      );
  }

  // ---------- Helpers ----------

  hasRol(...roles: Rol[]): boolean {
    const actual = this.rol();
    return actual !== null && roles.includes(actual);
  }

  /** Dashboard inicial según rol — útil para el redirect post-login. */
  dashboardDeRol(rol: Rol | null): string {
    if (rol === Rol.Admin) return '/admin';
    if (rol === Rol.Estudiante) return '/estudiante';
    return '/docente'; // default y fallback
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(ACCESS_KEY, res.access);
    localStorage.setItem(REFRESH_KEY, res.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._usuario.set(res.usuario);
  }

  private loadUserFromStorage(): Usuario | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJwt(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now;
    } catch {
      return true;
    }
  }

  private decodeJwt(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Token JWT inválido');
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadJson);
  }
}
