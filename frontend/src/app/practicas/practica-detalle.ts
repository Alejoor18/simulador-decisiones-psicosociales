import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Estudiante, Grupo } from '../core/models/academico.model';
import { EstadoPractica, PracticaDetalle } from '../core/models/practicas.model';
import { AcademicoService } from '../core/services/academico.service';
import { PracticasService } from '../core/services/practicas.service';

@Component({
  selector: 'app-practica-detalle',
  imports: [
    CommonModule, FormsModule, RouterLink, DatePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatCheckboxModule, MatProgressBarModule, MatSnackBarModule,
    MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './practica-detalle.html',
  styleUrl: './practica-detalle.scss',
})
export class PracticaDetallePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly practicas = inject(PracticasService);
  private readonly academico = inject(AcademicoService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly practica = signal<PracticaDetalle | null>(null);

  readonly estudiantes = signal<Estudiante[]>([]);
  readonly grupos = signal<Grupo[]>([]);
  readonly seleccionEst: Record<number, boolean> = {};
  readonly seleccionGrupo: Record<number, boolean> = {};

  readonly EstadoPractica = EstadoPractica;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/practicas']); return; }
    this.cargar(id);
    this.academico.listarEstudiantes().subscribe((r) => this.estudiantes.set(r.results));
    this.academico.listarGrupos().subscribe((r) => this.grupos.set(r.results));
  }

  cargar(id: number) {
    this.loading.set(true);
    this.practicas.obtener(id).subscribe({
      next: (p) => { this.practica.set(p); this.loading.set(false); },
      error: () => {
        this.snackBar.open('No se pudo cargar la práctica.', 'OK', { duration: 3500 });
        this.router.navigate(['/practicas']);
      },
    });
  }

  copiar(codigo: string) {
    navigator.clipboard.writeText(codigo);
    this.snackBar.open(`Código copiado: ${codigo}`, 'OK', { duration: 2000 });
  }

  autorizar() {
    const p = this.practica();
    if (!p) return;
    const estIds = Object.entries(this.seleccionEst).filter(([, v]) => v).map(([k]) => Number(k));
    const grupoIds = Object.entries(this.seleccionGrupo).filter(([, v]) => v).map(([k]) => Number(k));
    if (estIds.length === 0 && grupoIds.length === 0) {
      this.snackBar.open('Selecciona al menos un estudiante o grupo.', 'OK', { duration: 3000 });
      return;
    }
    this.practicas.autorizarEstudiantes(p.id, estIds, grupoIds).subscribe({
      next: (r) => {
        this.snackBar.open(`Se autorizaron ${r.creadas} estudiantes nuevos.`, 'OK', { duration: 3000 });
        for (const k of Object.keys(this.seleccionEst)) this.seleccionEst[Number(k)] = false;
        for (const k of Object.keys(this.seleccionGrupo)) this.seleccionGrupo[Number(k)] = false;
        this.cargar(p.id);
      },
      error: () => this.snackBar.open('No se pudo autorizar.', 'OK', { duration: 3500 }),
    });
  }

  iniciar() {
    const p = this.practica();
    if (!p) return;
    this.practicas.iniciar(p.id).subscribe({
      next: () => { this.snackBar.open('Práctica iniciada.', 'OK', { duration: 2500 }); this.cargar(p.id); },
    });
  }

  finalizar() {
    const p = this.practica();
    if (!p) return;
    if (!confirm('¿Finalizar esta práctica? No se podrán hacer más participaciones.')) return;
    this.practicas.finalizar(p.id).subscribe({
      next: () => { this.snackBar.open('Práctica finalizada.', 'OK', { duration: 2500 }); this.cargar(p.id); },
    });
  }
}
