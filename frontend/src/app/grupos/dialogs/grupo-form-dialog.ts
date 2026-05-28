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

import { AcademicoService } from '../../core/services/academico.service';
import { Grupo } from '../../core/models/academico.model';

interface DialogData {
  grupo?: Grupo;
}

@Component({
  selector: 'app-grupo-form-dialog',
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
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar grupo' : 'Crear grupo' }}</h2>

    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre del grupo</mat-label>
          <input matInput formControlName="nombre" required maxlength="150" />
          @if (form.controls.nombre.touched && form.controls.nombre.hasError('required')) {
            <mat-error>El nombre es obligatorio.</mat-error>
          }
          @for (e of fieldErrors('nombre'); track e) { <mat-error>{{ e }}</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3"></textarea>
          @for (e of fieldErrors('descripcion'); track e) { <mat-error>{{ e }}</mat-error> }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cancelar</button>
      <button mat-flat-button color="primary"
        [disabled]="form.invalid || loading()" (click)="guardar()">
        {{ esEdicion ? 'Guardar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.5rem; min-width: min(440px, 90vw); }
    `,
  ],
})
export class GrupoFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AcademicoService);
  private readonly dialogRef = inject(MatDialogRef<GrupoFormDialog>);

  readonly loading = signal(false);
  readonly serverErrors = signal<Record<string, string[]>>({});

  readonly esEdicion: boolean;
  readonly form;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.esEdicion = !!data.grupo;
    this.form = this.fb.nonNullable.group({
      nombre: [data.grupo?.nombre ?? '', [Validators.required, Validators.maxLength(150)]],
      descripcion: [data.grupo?.descripcion ?? ''],
    });
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
      ? this.servicio.actualizarGrupo(this.data.grupo!.id, payload)
      : this.servicio.crearGrupo(payload);

    obs$.subscribe({
      next: (g) => this.dialogRef.close(g),
      error: (err) => {
        this.loading.set(false);
        this.serverErrors.set(this.parse(err.error));
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }

  private parse(body: unknown): Record<string, string[]> {
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
