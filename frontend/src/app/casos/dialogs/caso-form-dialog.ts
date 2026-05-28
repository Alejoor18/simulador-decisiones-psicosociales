import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { CasoListItem, EstadoCaso } from '../../core/models/casos.model';
import { CasosService } from '../../core/services/casos.service';

interface DialogData { caso?: CasoListItem }

@Component({
  selector: 'app-caso-form-dialog',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressBarModule, MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar caso' : 'Crear caso' }}</h2>
    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="200" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción breve</mat-label>
          <textarea matInput formControlName="descripcion" rows="2"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Área psicosocial</mat-label>
            <input matInput formControlName="area_psicosocial" maxlength="150" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tiempo estimado (min)</mat-label>
            <input matInput type="number" formControlName="tiempo_estimado_min" min="1" />
          </mat-form-field>
        </div>

        @if (esEdicion) {
          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado">
              <mat-option value="BORRADOR">Borrador</mat-option>
              <mat-option value="EN_REVISION">En revisión</mat-option>
              <mat-option value="VALIDADO">Validado</mat-option>
              <mat-option value="ARCHIVADO">Archivado</mat-option>
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading()" (click)="guardar()">
        {{ esEdicion ? 'Guardar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.5rem; min-width: min(520px, 90vw); }
    .row { display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem; }
    @media (max-width: 480px) { .row { grid-template-columns: 1fr; } }
  `],
})
export class CasoFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(CasosService);
  private readonly dialogRef = inject(MatDialogRef<CasoFormDialog>);

  readonly loading = signal(false);
  readonly esEdicion: boolean;
  readonly form;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.esEdicion = !!data.caso;
    this.form = this.fb.nonNullable.group({
      nombre: [data.caso?.nombre ?? '', [Validators.required, Validators.maxLength(200)]],
      descripcion: [data.caso?.descripcion ?? ''],
      area_psicosocial: [data.caso?.area_psicosocial ?? ''],
      tiempo_estimado_min: [data.caso?.tiempo_estimado_min ?? 30],
      estado: [data.caso?.estado ?? EstadoCaso.Borrador],
    });
  }

  guardar(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const payload = this.form.getRawValue();
    const obs$ = this.esEdicion
      ? this.servicio.actualizarCaso(this.data.caso!.id, payload)
      : this.servicio.crearCaso(payload);
    obs$.subscribe({
      next: (caso) => this.dialogRef.close(caso),
      error: () => this.loading.set(false),
    });
  }

  cerrar() { this.dialogRef.close(null); }
}
