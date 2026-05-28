import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { JwtPayload, Rol, TokenPair, Usuario } from '../models/usuario.model';

const ACCESS_KEY = 'simulador.access';
const REFRESH_KEY = 'simulador.refresh';
const USER_KEY = 'simulador.user';

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

  loginDocente(username: string, password: string): Observable<TokenPair> {
    return this.http
      .post<TokenPair>(`${environment.apiUrl}/auth/token/`, { username, password })
      .pipe(
        tap((tokens) => {
          this.saveTokens(tokens);
          // El perfil del usuario lo cargaremos en una fase posterior cuando exista
          // el endpoint /api/auth/perfil/. Por ahora decodificamos el JWT para tener el user_id.
        }),
      );
  }

  // ---------- Acceso estudiante (correo + código de autorización) ----------

  loginEstudiante(correo: string, codigo: string): Observable<TokenPair> {
    return this.http
      .post<TokenPair>(`${environment.apiUrl}/auth/estudiante-acceso/`, { correo, codigo })
      .pipe(tap((tokens) => this.saveTokens(tokens)));
  }

  // ---------- Logout ----------

  logout(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
    this.router.navigate(['/auth']);
  }

  // ---------- Tokens ----------

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  refreshAccessToken(): Observable<{ access: string }> {
    const refresh = this.getRefreshToken();
    return this.http
      .post<{ access: string }>(`${environment.apiUrl}/auth/token/refresh/`, { refresh })
      .pipe(
        tap((res) => {
          localStorage.setItem(ACCESS_KEY, res.access);
        }),
      );
  }

  // ---------- Helpers ----------

  hasRol(...roles: Rol[]): boolean {
    const actual = this.rol();
    return actual !== null && roles.includes(actual);
  }

  private saveTokens(tokens: TokenPair): void {
    localStorage.setItem(ACCESS_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
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
