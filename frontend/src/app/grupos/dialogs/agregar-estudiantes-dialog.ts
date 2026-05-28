import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
  Estudiante,
  GrupoDetalle,
} from '../../core/models/academico.model';
import { AcademicoService } from '../../core/services/academico.service';

interface DialogData {
  grupo: GrupoDetalle;
}

@Component({
  selector: 'app-agregar-estudiantes-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Agregar estudiantes a "{{ data.grupo.nombre }}"</h2>

    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

    <mat-dialog-content>
      @if (disponibles().length === 0 && !loading()) {
        <p class="hint">
          Todos tus estudiantes ya están en este grupo, o no tienes estudiantes
          aún. Crea o agrega estudiantes desde la sección "Estudiantes".
        </p>
      } @else {
        <p class="hint">Selecciona los estudiantes que quieres agregar:</p>
        <ul class="lista">
          @for (e of disponibles(); track e.id) {
            <li>
              <mat-checkbox [(ngModel)]="seleccionados[e.id]">
                <span class="nombre">{{ e.nombre_completo }}</span>
                <span class="correo">{{ e.correo }}</span>
              </mat-checkbox>
            </li>
          }
        </ul>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="loading() || idsSeleccionados().length === 0"
        (click)="agregar()">
        Agregar ({{ idsSeleccionados().length }})
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .hint { margin: 0 0 0.75rem; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
      .lista {
        list-style: none; padding: 0; margin: 0;
        max-height: 360px; overflow-y: auto;
        min-width: min(440px, 90vw);
      }
      .lista li { padding: 0.25rem 0; }
      .nombre { font-weight: 500; }
      .correo { display: block; font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); margin-left: 1.75rem; }
    `,
  ],
})
export class AgregarEstudiantesDialog implements OnInit {
  private readonly servicio = inject(AcademicoService);
  private readonly dialogRef = inject(MatDialogRef<AgregarEstudiantesDialog>);

  readonly loading = signal(true);
  readonly disponibles = signal<Estudiante[]>([]);
  seleccionados: Record<number, boolean> = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    // Cargar todos los estudiantes del docente y excluir los que ya están en el grupo.
    this.servicio.listarEstudiantes().subscribe({
      next: (resp) => {
        const idsEnGrupo = new Set(this.data.grupo.estudiantes.map((e) => e.id));
        this.disponibles.set(resp.results.filter((e) => !idsEnGrupo.has(e.id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  idsSeleccionados(): number[] {
    return Object.entries(this.seleccionados)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
  }

  agregar(): void {
    const ids = this.idsSeleccionados();
    if (ids.length === 0) return;
    this.loading.set(true);
    this.servicio.agregarEstudiantesAGrupo(this.data.grupo.id, ids).subscribe({
      next: (grupo) => this.dialogRef.close(grupo),
      error: () => this.loading.set(false),
    });
  }

  cerrar(): void {
    this.dialogRef.close(null);
  }
}
