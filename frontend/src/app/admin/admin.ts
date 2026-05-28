import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AdminMetricas, ExtrasService } from '../core/services/extras.service';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, DecimalPipe, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <section class="page">
      <header>
        <h1>Panel de Administrador</h1>
        <p class="subtitle">Métricas globales del sistema.</p>
      </header>

      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

      @if (metricas(); as m) {
        <div class="grid">
          <mat-card class="stat-card">
            <mat-icon>school</mat-icon>
            <div class="num">{{ m.docentes }}</div>
            <div class="label">Docentes registrados</div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>group</mat-icon>
            <div class="num">{{ m.estudiantes }}</div>
            <div class="label">Estudiantes</div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>workspaces</mat-icon>
            <div class="num">{{ m.grupos }}</div>
            <div class="label">Grupos</div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>menu_book</mat-icon>
            <div class="num">{{ m.casos }}</div>
            <div class="label">Casos de estudio</div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>event</mat-icon>
            <div class="num">{{ m.practicas }}</div>
            <div class="label">Prácticas</div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>assessment</mat-icon>
            <div class="num">{{ m.resultados }}</div>
            <div class="label">Resultados</div>
          </mat-card>
          <mat-card class="stat-card destacada">
            <mat-icon>star</mat-icon>
            <div class="num">{{ m.nota_promedio | number:'1.0-1' }}</div>
            <div class="label">Nota promedio</div>
          </mat-card>
        </div>

        <h2>Prácticas por estado</h2>
        <div class="estados">
          @for (e of estadosLista(); track e.key) {
            <div class="estado-item">
              <span class="num">{{ e.value }}</span>
              <span class="label">{{ etiquetaEstado(e.key) }}</span>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 500; }
    .subtitle { margin: 0.25rem 0 0; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
    h2 { margin: 0; font-size: 1.1rem; font-weight: 500; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; }
    .stat-card {
      padding: 1.25rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
      mat-icon { font-size: 2rem; width: 2rem; height: 2rem; color: var(--mat-sys-primary); }
      .num { font-size: 2rem; font-weight: 600; color: var(--mat-sys-on-surface); }
      .label { font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
      &.destacada { background: var(--mat-sys-primary-container); .num { color: var(--mat-sys-on-primary-container); } .label { color: var(--mat-sys-on-primary-container); } mat-icon { color: var(--mat-sys-on-primary-container); } }
    }
    .estados { display: flex; gap: 1rem; flex-wrap: wrap; }
    .estado-item {
      padding: 0.75rem 1.25rem; background: var(--mat-sys-surface-container); border-radius: 8px;
      display: flex; flex-direction: column; align-items: center;
      .num { font-weight: 600; font-size: 1.2rem; }
      .label { font-size: 0.8rem; color: var(--mat-sys-on-surface-variant); }
    }
  `],
})
export class Admin implements OnInit {
  private readonly servicio = inject(ExtrasService);

  readonly loading = signal(true);
  readonly metricas = signal<AdminMetricas | null>(null);

  ngOnInit() {
    this.servicio.adminMetricas().subscribe({
      next: (m) => { this.metricas.set(m); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  estadosLista() {
    const m = this.metricas();
    if (!m) return [];
    return Object.entries(m.practicas_por_estado).map(([key, value]) => ({ key, value }));
  }

  etiquetaEstado(k: string): string {
    return ({
      SIN_INICIAR: 'Sin iniciar',
      EN_CURSO: 'En curso',
      FINALIZADA: 'Finalizadas',
      CANCELADA: 'Canceladas',
    } as Record<string, string>)[k] || k;
  }
}
