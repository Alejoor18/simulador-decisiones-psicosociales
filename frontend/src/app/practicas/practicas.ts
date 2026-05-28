import { CommonModule, DatePipe } from '@angular/common';
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

import { Practica } from '../core/models/practicas.model';
import { PracticasService } from '../core/services/practicas.service';
import { PracticaFormDialog } from './dialogs/practica-form-dialog';

@Component({
  selector: 'app-practicas',
  imports: [
    CommonModule, DatePipe, RouterLink,
    MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatDialogModule, MatProgressBarModule, MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="title">Prácticas académicas</h1>
          <p class="subtitle">
            @if (!loading()) { {{ practicas().length }} prácticas. } @else { Cargando… }
          </p>
        </div>
        <button mat-flat-button color="primary" (click)="crear()">
          <mat-icon>add</mat-icon><span>Nueva práctica</span>
        </button>
      </header>

      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

      <div class="table-wrapper">
        <table mat-table [dataSource]="practicas()" class="table">
          <ng-container matColumnDef="nombre">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let p">
              <a [routerLink]="['/practicas', p.id]" class="link">{{ p.nombre }}</a>
              <div class="caso-name">{{ p.caso_nombre }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="fechas">
            <th mat-header-cell *matHeaderCellDef>Inicio · Fin</th>
            <td mat-cell *matCellDef="let p">
              <div>{{ p.fecha_inicio | date:'short' }}</div>
              <div>{{ p.fecha_fin | date:'short' }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="autorizados">
            <th mat-header-cell *matHeaderCellDef>Estudiantes</th>
            <td mat-cell *matCellDef="let p">{{ p.autorizaciones_count }}</td>
          </ng-container>

          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let p">
              <mat-chip [class]="'estado-' + p.estado.toLowerCase()">{{ p.estado_display }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef class="acc">Acciones</th>
            <td mat-cell *matCellDef="let p" class="acc">
              <button mat-icon-button matTooltip="Abrir" [routerLink]="['/practicas', p.id]">
                <mat-icon>open_in_new</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Eliminar" (click)="eliminar(p)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>

          <tr *matNoDataRow class="no-data">
            <td [attr.colspan]="cols.length">
              @if (!loading()) { No has creado prácticas aún. }
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
    .caso-name { color: var(--mat-sys-on-surface-variant); font-size: 0.8rem; }
    .acc { width: 110px; text-align: right; }
    .no-data td { padding: 2rem; text-align: center; color: var(--mat-sys-on-surface-variant); }
    .estado-en_curso { background-color: var(--mat-sys-primary-container) !important; color: var(--mat-sys-on-primary-container) !important; }
    .estado-finalizada { opacity: 0.7; }
  `],
})
export class Practicas implements OnInit {
  private readonly servicio = inject(PracticasService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly practicas = signal<Practica[]>([]);
  readonly cols = ['nombre', 'fechas', 'autorizados', 'estado', 'acciones'];

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.servicio.listar().subscribe({
      next: (r) => { this.practicas.set(r.results); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('No se pudieron cargar las prácticas.', 'OK', { duration: 3500 }); },
    });
  }

  crear() {
    this.dialog.open(PracticaFormDialog, { width: '600px' }).afterClosed().subscribe((p) => {
      if (p) { this.cargar(); this.router.navigate(['/practicas', p.id]); }
    });
  }

  eliminar(p: Practica) {
    if (!confirm(`¿Eliminar la práctica "${p.nombre}"? Se borrarán las autorizaciones y participaciones.`)) return;
    this.servicio.eliminar(p.id).subscribe({
      next: () => { this.snackBar.open('Práctica eliminada.', 'OK', { duration: 2500 }); this.cargar(); },
      error: () => this.snackBar.open('No se pudo eliminar.', 'OK', { duration: 3500 }),
    });
  }
}
