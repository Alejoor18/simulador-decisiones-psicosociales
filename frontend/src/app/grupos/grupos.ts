import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Grupo } from '../core/models/academico.model';
import { AcademicoService } from '../core/services/academico.service';
import { GrupoFormDialog } from './dialogs/grupo-form-dialog';

@Component({
  selector: 'app-grupos',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './grupos.html',
  styleUrl: './grupos.scss',
})
export class Grupos implements OnInit {
  private readonly servicio = inject(AcademicoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly grupos = signal<Grupo[]>([]);
  readonly grupoExpandidoId = signal<number | null>(null);
  readonly detalle = signal<import('../core/models/academico.model').GrupoDetalle | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.servicio.listarGrupos().subscribe({
      next: (resp) => {
        this.grupos.set(resp.results);
        this.loading.set(false);
        // Si había un grupo expandido, refrescar su detalle.
        const id = this.grupoExpandidoId();
        if (id) this.cargarDetalle(id);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudieron cargar los grupos.', 'OK', { duration: 3500 });
      },
    });
  }

  cargarDetalle(id: number): void {
    this.servicio.obtenerGrupo(id).subscribe((g) => this.detalle.set(g));
  }

  expandir(g: Grupo): void {
    if (this.grupoExpandidoId() === g.id) {
      this.grupoExpandidoId.set(null);
      this.detalle.set(null);
    } else {
      this.grupoExpandidoId.set(g.id);
      this.cargarDetalle(g.id);
    }
  }

  crear(): void {
    this.dialog
      .open(GrupoFormDialog, { width: '500px', data: {} })
      .afterClosed()
      .subscribe((g) => {
        if (g) this.cargar();
      });
  }

  editar(g: Grupo, ev: Event): void {
    ev.stopPropagation();
    this.dialog
      .open(GrupoFormDialog, { width: '500px', data: { grupo: g } })
      .afterClosed()
      .subscribe((res) => {
        if (res) this.cargar();
      });
  }

  eliminar(g: Grupo, ev: Event): void {
    ev.stopPropagation();
    if (!confirm(`¿Eliminar el grupo "${g.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.servicio.eliminarGrupo(g.id).subscribe({
      next: () => {
        this.snackBar.open(`Grupo eliminado: ${g.nombre}`, 'OK', { duration: 3000 });
        if (this.grupoExpandidoId() === g.id) {
          this.grupoExpandidoId.set(null);
          this.detalle.set(null);
        }
        this.cargar();
      },
      error: () => this.snackBar.open('No se pudo eliminar.', 'OK', { duration: 3500 }),
    });
  }

  async agregarEstudiantes(): Promise<void> {
    const detalle = this.detalle();
    if (!detalle) return;
    const { AgregarEstudiantesDialog } = await import(
      './dialogs/agregar-estudiantes-dialog'
    );
    this.dialog
      .open(AgregarEstudiantesDialog, { width: '500px', data: { grupo: detalle } })
      .afterClosed()
      .subscribe((g) => {
        if (g) {
          this.detalle.set(g);
          this.cargar();
        }
      });
  }

  removerEstudiante(estudianteId: number): void {
    const detalle = this.detalle();
    if (!detalle) return;
    if (!confirm('¿Remover este estudiante del grupo?')) return;
    this.servicio
      .removerEstudiantesDeGrupo(detalle.id, [estudianteId])
      .subscribe({
        next: (g) => {
          this.detalle.set(g);
          this.cargar();
        },
      });
  }
}
