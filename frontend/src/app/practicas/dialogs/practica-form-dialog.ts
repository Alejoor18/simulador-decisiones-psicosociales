import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';

import { CasoListItem } from '../../core/models/casos.model';
import { CasosService } from '../../core/services/casos.service';
import { PracticasService } from '../../core/services/practicas.service';

@Component({
  selector: 'app-practica-form-dialog',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressBarModule, MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Crear práctica académica</h2>
    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" maxlength="200" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Caso de estudio</mat-label>
          <mat-select formControlName="caso" required>
            @for (c of casos(); track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
            }
          </mat-select>
          @if (casos().length === 0 && !cargandoCasos()) {
            <mat-hint>No tienes casos creados. Crea uno desde "Casos de estudio".</mat-hint>
          }
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha y hora de inicio</mat-label>
            <input matInput type="datetime-local" formControlName="fecha_inicio" required />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha y hora de fin</mat-label>
            <input matInput type="datetime-local" formControlName="fecha_fin" required />
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Tiempo máximo (min)</mat-label>
            <input matInput type="number" formControlName="tiempo_max_min" min="1" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Lugar (opcional)</mat-label>
            <input matInput formControlName="lugar_fisico" maxlength="200" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Mensaje para los estudiantes</mat-label>
          <textarea matInput formControlName="mensaje_personalizado" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cancelar</button>
      <button mat-flat-button color="primary"
        [disabled]="form.invalid || loading() || casos().length === 0" (click)="guardar()">
        Crear
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.5rem; min-width: min(560px, 90vw); }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    @media (max-width: 540px) { .row { grid-template-columns: 1fr; } }
  `],
})
export class PracticaFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly practicas = inject(PracticasService);
  private readonly casosSrv = inject(CasosService);
  private readonly dialogRef = inject(MatDialogRef<PracticaFormDialog>);

  readonly loading = signal(false);
  readonly cargandoCasos = signal(true);
  readonly casos = signal<CasoListItem[]>([]);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    caso: [0 as number | null, Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    tiempo_max_min: [30],
    lugar_fisico: [''],
    mensaje_personalizado: [''],
  });

  ngOnInit() {
    this.casosSrv.listarCasos().subscribe({
      next: (resp) => { this.casos.set(resp.results); this.cargandoCasos.set(false); },
      error: () => this.cargandoCasos.set(false),
    });
  }

  guardar() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const v = this.form.getRawValue();
    // datetime-local → ISO con timezone local
    const payload = {
      nombre: v.nombre,
      caso: v.caso as number,
      fecha_inicio: new Date(v.fecha_inicio).toISOString(),
      fecha_fin: new Date(v.fecha_fin).toISOString(),
      tiempo_max_min: v.tiempo_max_min,
      lugar_fisico: v.lugar_fisico,
      mensaje_personalizado: v.mensaje_personalizado,
    };
    this.practicas.crear(payload).subscribe({
      next: (p) => this.dialogRef.close(p),
      error: () => this.loading.set(false),
    });
  }

  cerrar() { this.dialogRef.close(null); }
}
