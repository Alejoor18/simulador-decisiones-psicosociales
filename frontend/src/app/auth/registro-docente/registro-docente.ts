import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

/** Valida que `password` y `password_confirm` coincidan. */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value;
  const confirm = group.get('password_confirm')?.value;
  return pwd && confirm && pwd !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-registro-docente',
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
  templateUrl: './registro-docente.html',
  styleUrl: './registro-docente.scss',
})
export class RegistroDocente {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group(
    {
      first_name: ['', [Validators.required, Validators.maxLength(150)]],
      last_name: ['', [Validators.required, Validators.maxLength(150)]],
      username: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirm: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly hidePasswordConfirm = signal(true);
  readonly serverErrors = signal<Record<string, string[]>>({});

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.serverErrors.set({});

    this.auth.registroDocente(this.form.getRawValue()).subscribe({
      next: () => {
        const destino = this.auth.dashboardDeRol(this.auth.rol());
        this.router.navigateByUrl(destino);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.serverErrors.set(this.parseServerErrors(err));
      },
    });
  }

  /** Errores específicos del backend para un campo dado. */
  fieldErrors(field: string): string[] {
    return this.serverErrors()[field] ?? [];
  }

  /** True si hay errores generales (no asociados a un campo). */
  get hasGeneralError(): boolean {
    return 'non_field_errors' in this.serverErrors() || 'detail' in this.serverErrors();
  }

  generalError(): string {
    const errs = this.serverErrors();
    return errs['non_field_errors']?.[0] ?? errs['detail']?.[0] ?? '';
  }

  private parseServerErrors(err: HttpErrorResponse): Record<string, string[]> {
    if (err.status === 0) return { non_field_errors: ['No se pudo conectar con el servidor.'] };
    const body = err.error;
    if (!body || typeof body !== 'object') {
      return { non_field_errors: ['Error inesperado en el registro.'] };
    }
    // DRF devuelve { campo: ["mensaje1", "mensaje2"] }
    const parsed: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(body)) {
      parsed[key] = Array.isArray(value) ? (value as string[]) : [String(value)];
    }
    return parsed;
  }
}
