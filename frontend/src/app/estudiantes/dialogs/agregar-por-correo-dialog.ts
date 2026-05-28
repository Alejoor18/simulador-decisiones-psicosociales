import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AcademicoService } from '../../core/services/academico.service';

@Component({
  selector: 'app-agregar-por-correo-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Agregar estudiante por correo</h2>

    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

    <mat-dialog-content>
      <p class="hint">
        Ingresa el correo del estudiante. Si ya existe en el sistema, se vinculará
        a tu lista; si no, se creará con los datos provistos.
      </p>

      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Correo electrónico</mat-label>
          <input matInput type="email" formControlName="correo" required autocomplete="email" />
          @if (form.controls.correo.touched && form.controls.correo.hasError('required')) {
            <mat-error>El correo es obligatorio.</mat-error>
          }
          @if (form.controls.correo.touched && form.controls.correo.hasError('email')) {
            <mat-error>Formato inválido.</mat-error>
          }
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Nombre (opcional)</mat-label>
            <input matInput formControlName="first_name" />
            <mat-hint>Solo se usa si el estudiante es nuevo.</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellido (opcional)</mat-label>
            <input matInput formControlName="last_name" />
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || loading()"
        (click)="enviar()">
        Agregar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.5rem; min-width: min(440px, 90vw); }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
      .hint { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
      @media (max-width: 480px) { .row { grid-template-columns: 1fr; } }
    `,
  ],
})
export class AgregarPorCorreoDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AcademicoService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<AgregarPorCorreoDialog>);

  readonly loading = signal(false);
  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    first_name: [''],
    last_name: [''],
  });

  enviar(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.servicio.agregarPorCorreo(this.form.getRawValue()).subscribe({
      next: (est) => {
        const msg = est._creado
          ? `Estudiante creado: ${est.correo}`
          : `Estudiante existente vinculado: ${est.correo}`;
        this.snackBar.open(msg, 'OK', { duration: 3500 });
        this.dialogRef.close(est);
      },
      error: (err) => {
        this.loading.set(false);
        const detalle = err?.error?.correo?.[0] ?? err?.error?.detail ?? 'Error al agregar.';
        this.snackBar.open(detalle, 'OK', { duration: 4000 });
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }
}
