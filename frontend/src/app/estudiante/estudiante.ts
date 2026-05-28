import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { Rol } from '../core/models/usuario.model';
import { PracticasService } from '../core/services/practicas.service';

const ACCESS_KEY = 'simulador.access';
const REFRESH_KEY = 'simulador.refresh';
const USER_KEY = 'simulador.user';

@Component({
  selector: 'app-estudiante',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressBarModule,
  ],
  template: `
    <div class="page">
      <div class="card">
        <header>
          <h2>{{ appName }}</h2>
          <p>Acceso del estudiante</p>
        </header>

        @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

        <form [formGroup]="form" (ngSubmit)="ingresar()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="correo" autocomplete="email" required />
            @if (form.controls.correo.touched && form.controls.correo.invalid) {
              <mat-error>Correo inválido o vacío.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Código de acceso</mat-label>
            <input matInput formControlName="codigo" required maxlength="16" class="codigo-input" />
            <mat-hint>El docente te lo entregó (ej: AB3XYZ7K).</mat-hint>
            @if (form.controls.codigo.touched && form.controls.codigo.hasError('required')) {
              <mat-error>El código es obligatorio.</mat-error>
            }
          </mat-form-field>

          @if (error()) {
            <div class="server-error">
              <mat-icon>error_outline</mat-icon>
              <span>{{ error() }}</span>
            </div>
          }

          <button mat-flat-button color="primary" type="submit"
            [disabled]="form.invalid || loading()">
            Ingresar a la práctica
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: var(--mat-sys-surface-container-low); }
    .card { width: 100%; max-width: 460px; padding: 2rem 1.75rem; background: var(--mat-sys-surface); border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 1rem; }
    header { text-align: center; }
    header h2 { margin: 0; color: var(--mat-sys-primary); }
    header p { margin: 0.25rem 0 0; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
    .form { display: flex; flex-direction: column; gap: 0.25rem; }
    .codigo-input { letter-spacing: 2px; font-family: monospace; font-size: 1.1rem; }
    .server-error {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1rem; border-radius: 8px;
      background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container);
      font-size: 0.9rem;
    }
    button[type=submit] { margin-top: 0.5rem; padding: 0.5rem 0; }
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

    const { correo, codigo } = this.form.getRawValue();
    this.practicas.accesoEstudiante(correo, codigo.toUpperCase()).subscribe({
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
        this.error.set(err.error?.non_field_errors?.[0] || err.error?.detail || 'No se pudo acceder.');
      },
    });
  }
}
