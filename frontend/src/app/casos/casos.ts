import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';

import { CasoListItem } from '../core/models/casos.model';
import { CasosService } from '../core/services/casos.service';
import { CasoFormDialog } from './dialogs/caso-form-dialog';

@Component({
  selector: 'app-casos',
  imports: [
    CommonModule, RouterLink,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatDialogModule, MatProgressBarModule, MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="title">Casos de estudio</h1>
          <p class="subtitle">
            @if (!loading()) { {{ casos().length }} casos. }
            @else { Cargando… }
          </p>
        </div>
        <button mat-flat-button color="primary" (click)="crear()">
          <mat-icon>add</mat-icon><span>Crear caso</span>
        </button>
      </header>

      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

      <div class="table-wrapper">
        <table mat-table [dataSource]="casos()" class="table">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let c">
              <a [routerLink]="['/casos', c.id]" class="link">{{ c.nombre }}</a>
              @if (c.area_psicosocial) { <span class="area"> · {{ c.area_psicosocial }}</span> }
            </td>
          </ng-container>

          <ng-container matColumnDef="escenarios">
            <th mat-header-cell *matHeaderCellDef>Escenarios</th>
            <td mat-cell *matCellDef="let c">{{ c.escenarios_count }}</td>
          </ng-container>

          <ng-container matColumnDef="tiempo">
            <th mat-header-cell *matHeaderCellDef>Tiempo</th>
            <td mat-cell *matCellDef="let c">{{ c.tiempo_estimado_min }} min</td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [class]="'estado-' + c.estado.toLowerCase()">{{ c.estado_display }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef class="acc">Acciones</th>
            <td mat-cell *matCellDef="let c" class="acc">
              <button mat-icon-button matTooltip="Editar contenido" [routerLink]="['/casos', c.id]">
                <mat-icon>open_in_new</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Editar metadatos" (click)="editar(c)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Eliminar" (click)="eliminar(c)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>

          <tr *matNoDataRow class="no-data">
            <td [attr.colspan]="cols.length">
              @if (!loading()) { No has creado casos aún. Usa "Crear caso" para empezar. }
            </td>
          </tr>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; button { display: inline-flex; align-items: center; gap: 0.4rem; } }
    .title { margin: 0; font-size: 1.5rem; font-weight: 500; }
    .subtitle { margin: 0.25rem 0 0; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
    .table-wrapper { background: var(--mat-sys-surface); border-radius: 12px; overflow: auto; }
    .table { width: 100%; }
    .link { color: var(--mat-sys-primary); text-decoration: none; font-weight: 500; &:hover { text-decoration: underline; } }
    .area { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; }
    .acc { width: 160px; text-align: right; }
    .no-data td { padding: 2rem; text-align: center; color: var(--mat-sys-on-surface-variant); }
    mat-chip { font-size: 0.75rem !important; }
    .estado-borrador { background-color: var(--mat-sys-surface-variant) !important; }
    .estado-validado { background-color: var(--mat-sys-primary-container) !important; color: var(--mat-sys-on-primary-container) !important; }
    .estado-archivado { opacity: 0.6; }
  `],
})
export class Casos implements OnInit {
  private readonly servicio = inject(CasosService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly casos = signal<CasoListItem[]>([]);
  readonly cols = ['nombre', 'escenarios', 'tiempo', 'estado', 'acciones'];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.servicio.listarCasos().subscribe({
      next: (resp) => { this.casos.set(resp.results); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('No se pudieron cargar los casos.', 'OK', { duration: 3500 }); },
    });
  }

  crear() {
    this.dialog.open(CasoFormDialog, { width: '560px', data: {} }).afterClosed().subscribe((c) => {
      if (c) {
        this.cargar();
        this.router.navigate(['/casos', c.id]);
      }
    });
  }

  editar(c: CasoListItem) {
    this.dialog.open(CasoFormDialog, { width: '560px', data: { caso: c } }).afterClosed().subscribe((r) => {
      if (r) this.cargar();
    });
  }

  eliminar(c: CasoListItem) {
    if (!confirm(`¿Eliminar el caso "${c.nombre}"? Se borrarán escenarios, preguntas y respuestas.`)) return;
    this.servicio.eliminarCaso(c.id).subscribe({
      next: () => { this.snackBar.open('Caso eliminado.', 'OK', { duration: 2500 }); this.cargar(); },
      error: () => this.snackBar.open('No se pudo eliminar.', 'OK', { duration: 3500 }),
    });
  }
}
