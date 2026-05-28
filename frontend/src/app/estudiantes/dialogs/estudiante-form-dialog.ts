import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AcademicoService } from '../../core/services/academico.service';
import { Estudiante } from '../../core/models/academico.model';

interface DialogData {
  estudiante?: Estudiante;
}

@Component({
  selector: 'app-estudiante-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar estudiante' : 'Crear estudiante' }}</h2>

    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Correo electrónico</mat-label>
          <input matInput type="email" formControlName="correo" required />
          @if (form.controls.correo.touched && form.controls.correo.hasError('required')) {
            <mat-error>El correo es obligatorio.</mat-error>
          }
          @if (form.controls.correo.touched && form.controls.correo.hasError('email')) {
            <mat-error>Formato inválido.</mat-error>
          }
          @for (e of fieldErrors('correo'); track e) { <mat-error>{{ e }}</mat-error> }
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="first_name" required />
            @for (e of fieldErrors('first_name'); track e) { <mat-error>{{ e }}</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="last_name" required />
            @for (e of fieldErrors('last_name'); track e) { <mat-error>{{ e }}</mat-error> }
          </mat-form-field>
        </div>

        @if (esEdicion) {
          <mat-slide-toggle formControlName="activo">Activo</mat-slide-toggle>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || loading()"
        (click)="guardar()">
        {{ esEdicion ? 'Guardar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.5rem; min-width: min(420px, 90vw); }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
      @media (max-width: 480px) { .row { grid-template-columns: 1fr; } }
    `,
  ],
})
export class EstudianteFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AcademicoService);
  private readonly dialogRef = inject(MatDialogRef<EstudianteFormDialog>);

  readonly loading = signal(false);
  readonly serverErrors = signal<Record<string, string[]>>({});

  readonly esEdicion: boolean;
  readonly form;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.esEdicion = !!data.estudiante;
    this.form = this.fb.nonNullable.group({
      correo: [data.estudiante?.correo ?? '', [Validators.required, Validators.email]],
      first_name: [data.estudiante?.first_name ?? '', [Validators.required]],
      last_name: [data.estudiante?.last_name ?? '', [Validators.required]],
      activo: [data.estudiante?.activo ?? true],
    });
    if (this.esEdicion) {
      // El correo no se edita (es la clave global del estudiante).
      this.form.controls.correo.disable();
    }
  }

  fieldErrors(field: string): string[] {
    return this.serverErrors()[field] ?? [];
  }

  guardar(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.serverErrors.set({});
    const payload = this.form.getRawValue();

    const obs$ = this.esEdicion
      ? this.servicio.actualizarEstudiante(this.data.estudiante!.id, {
          first_name: payload.first_name,
          last_name: payload.last_name,
          activo: payload.activo,
        })
      : this.servicio.crearEstudiante({
          correo: payload.correo,
          first_name: payload.first_name,
          last_name: payload.last_name,
        });

    obs$.subscribe({
      next: (estudiante) => this.dialogRef.close(estudiante),
      error: (err) => {
        this.loading.set(false);
        this.serverErrors.set(this.parseErrors(err.error));
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }

  private parseErrors(body: unknown): Record<string, string[]> {
    if (!body || typeof body !== 'object') {
      return { non_field_errors: ['Error inesperado.'] };
    }
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(body)) {
      out[k] = Array.isArray(v) ? (v as string[]) : [String(v)];
    }
    return out;
  }
}
