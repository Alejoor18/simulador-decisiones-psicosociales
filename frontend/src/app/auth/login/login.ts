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

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hidePassword = signal(true);

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();

    this.auth.loginDocente(username, password).subscribe({
      next: () => {
        const destino = this.auth.dashboardDeRol(this.auth.rol());
        this.router.navigateByUrl(destino);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.extractErrorMessage(err));
      },
    });
  }

  togglePassword(): void {
    this.hidePassword.update((v) => !v);
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    if (err.status === 401) return 'Usuario o contraseña incorrectos.';
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    return 'Error inesperado al iniciar sesión. Intenta de nuevo.';
  }
}
