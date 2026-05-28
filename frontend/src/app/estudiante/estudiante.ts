import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';

import { environment } from '../../environments/environment';
import { Rol } from '../core/models/usuario.model';
import { PracticasService } from '../core/services/practicas.service';

const ACCESS_KEY = 'simulador.access';
const REFRESH_KEY = 'simulador.refresh';
const USER_KEY = 'simulador.user';

@Component({
  selector: 'app-estudiante',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressBarModule,
  ],
  template: `
    <div class="page bg-gradient">
      <header class="top">
        <a routerLink="/auth/login" class="back">
          <mat-icon>arrow_back</mat-icon><span>Acceso docente</span>
        </a>
      </header>

      <div class="content">
        <section class="hero">
          <span class="badge"><mat-icon>school</mat-icon> Estudiante</span>
          <h1 class="display">Tu práctica te espera</h1>
          <p class="lead">
            Vas a entrar a un caso narrativo donde tus decisiones cuentan.
            Lee con calma, decide con criterio.
          </p>

          <ul class="tips">
            <li><mat-icon>schedule</mat-icon> Tendrás un tiempo límite — el reloj corre al iniciar.</li>
            <li><mat-icon>edit</mat-icon> Puedes cambiar tus respuestas antes de finalizar.</li>
            <li><mat-icon>lightbulb</mat-icon> Verás la retroalimentación cuando termines.</li>
          </ul>
        </section>

        <section class="form-card elevated-card anim-fade-up">
          <h2>Ingresa con tu código</h2>
          <p class="hint">El docente te entregó un código único para esta práctica.</p>

          @if (loading()) { <mat-progress-bar mode="indeterminate" class="progress" /> }

          <form [formGroup]="form" (ngSubmit)="ingresar()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <mat-icon matIconPrefix>mail</mat-icon>
              <input matInput type="email" formControlName="correo" autocomplete="email" required />
              @if (form.controls.correo.touched && form.controls.correo.invalid) {
                <mat-error>Correo inválido o vacío.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="codigo-field">
              <mat-label>Código de acceso</mat-label>
              <mat-icon matIconPrefix>key</mat-icon>
              <input matInput formControlName="codigo" required maxlength="16" class="codigo-input" placeholder="AB3XYZ7K" />
              <mat-hint>El docente te lo entregó.</mat-hint>
              @if (form.controls.codigo.touched && form.controls.codigo.hasError('required')) {
                <mat-error>El código es obligatorio.</mat-error>
              }
            </mat-form-field>

            @if (error()) {
              <div class="server-error" role="alert">
                <mat-icon>error_outline</mat-icon>
                <div>
                  <strong>No se pudo ingresar</strong>
                  <span>{{ error() }}</span>
                </div>
              </div>
            }

            <button mat-flat-button color="primary" type="submit"
              [disabled]="form.invalid || loading()" class="submit-btn">
              <mat-icon>arrow_forward</mat-icon>
              <span>Empezar práctica</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }

    .top {
      max-width: 1100px; margin: 0 auto 1.5rem; width: 100%;
      .back {
        display: inline-flex; align-items: center; gap: 0.25rem;
        color: var(--mat-sys-on-surface); text-decoration: none;
        opacity: 0.7; font-size: 0.9rem;
        &:hover { opacity: 1; }
      }
    }

    .content {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3rem;
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
      flex: 1;
      align-items: center;
    }

    .hero {
      display: flex; flex-direction: column; gap: 1rem;

      .badge {
        align-self: flex-start;
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.35rem 0.85rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent);
        color: var(--mat-sys-primary);
        font-size: 0.85rem; font-weight: 600;
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }

      .display {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--mat-sys-primary), var(--mat-sys-tertiary));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .lead { margin: 0; font-size: 1.05rem; line-height: 1.55; color: var(--mat-sys-on-surface); opacity: 0.85; }

      .tips {
        list-style: none; padding: 0; margin: 0.5rem 0 0;
        display: flex; flex-direction: column; gap: 0.5rem;

        li {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.95rem;
          mat-icon { color: var(--mat-sys-primary); }
        }
      }
    }

    .form-card {
      padding: 2rem;
      display: flex; flex-direction: column; gap: 0.75rem;

      h2 { margin: 0; font-size: 1.3rem; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; }
      .hint { margin: 0; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
    }

    .progress { border-radius: 999px; overflow: hidden; }

    .form { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.5rem; }
    .codigo-input { letter-spacing: 3px; font-family: 'Inter', monospace; font-size: 1.05rem; text-transform: uppercase; font-weight: 600; }

    .submit-btn {
      margin-top: 0.75rem;
      height: 52px;
      border-radius: 14px;
      font-weight: 600; font-size: 1rem;
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    }

    .server-error {
      display: flex; gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
      font-size: 0.9rem;
      mat-icon { flex-shrink: 0; margin-top: 2px; }
      div { display: flex; flex-direction: column; gap: 0.15rem; }
      strong { font-weight: 600; }
    }

    @media (max-width: 900px) {
      .content { grid-template-columns: 1fr; gap: 1.5rem; }
      .hero .display { font-size: 1.8rem; }
      .hero .tips { display: none; }
    }
  `],
})
export class Estudiante {
  private readonly fb = inject(FormBuilder);
  private readonly practicas = inject(PracticasService);
  private readonly router = inject(Router);

  readonly appName = environment.appName;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    codigo: ['', [Validators.required]],
  });

  ingresar() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    const correo = this.form.controls.correo.value.toLowerCase().trim();
    const codigo = this.form.controls.codigo.value.toUpperCase().trim();

    this.practicas.accesoEstudiante(correo, codigo).subscribe({
      next: (res) => {
        localStorage.setItem(ACCESS_KEY, res.access);
        localStorage.setItem(REFRESH_KEY, res.refresh);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: res.estudiante.id,
          username: res.estudiante.correo,
          email: res.estudiante.correo,
          nombre_completo: res.estudiante.nombre_completo,
          rol: Rol.Estudiante,
        }));
        localStorage.setItem('simulador.practica_activa', JSON.stringify(res.practica));
        this.router.navigate(['/estudiante/simulacion']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg =
          err.error?.non_field_errors?.[0] ||
          err.error?.correo?.[0] ||
          err.error?.codigo?.[0] ||
          err.error?.detail ||
          (err.status === 0
            ? 'No hay conexión con el servidor. Verifica que el backend esté corriendo.'
            : 'Datos incorrectos. Verifica tu correo y código.');
        this.error.set(msg);
      },
    });
  }
}
