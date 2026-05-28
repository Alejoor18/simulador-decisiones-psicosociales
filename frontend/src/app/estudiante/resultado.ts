import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { Resultado } from '../core/models/practicas.model';
import { SimulacionService } from '../core/services/simulacion.service';

@Component({
  selector: 'app-resultado',
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule,
  ],
  template: `
    <div class="page">
      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

      @if (resultado(); as r) {
        <mat-card class="resumen">
          <div class="nota">
            <div class="circulo" [style.--pct]="porcentaje() + '%'">
              <span class="valor">{{ r.nota_final }}</span>
              <span class="max">/ 100</span>
            </div>
          </div>

          <div class="header">
            <h1>¡Práctica finalizada!</h1>
            <p class="caso">{{ r.caso_nombre }} · {{ r.practica_nombre }}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <mat-icon class="ok">check_circle</mat-icon>
              <strong>{{ r.correctas }}</strong> correctas
            </div>
            <div class="stat">
              <mat-icon class="err">cancel</mat-icon>
              <strong>{{ r.incorrectas }}</strong> incorrectas
            </div>
            <div class="stat">
              <mat-icon class="ne">help_outline</mat-icon>
              <strong>{{ r.no_respondidas }}</strong> sin responder
            </div>
          </div>

          @if (r.feedback_docente) {
            <section class="feedback">
              <h3>Feedback de tu docente</h3>
              <p>{{ r.feedback_docente }}</p>
            </section>
          }
        </mat-card>

        <h2 class="seccion-titulo">Retroalimentación pregunta por pregunta</h2>

        @for (d of r.detalle_preguntas; track d.pregunta_id; let i = $index) {
          <mat-card class="pregunta-card"
            [class.correcta]="d.respondida && d.respuesta_elegida?.es_correcta"
            [class.incorrecta]="d.respondida && d.respuesta_elegida && !d.respuesta_elegida.es_correcta"
            [class.no-respondida]="!d.respondida">
            <h3>Pregunta {{ i + 1 }}: {{ d.enunciado }}</h3>

            @if (!d.respondida) {
              <p class="status">⏭ No respondida</p>
            }

            @if (d.respuesta_elegida; as resp) {
              <div class="tu-respuesta">
                <strong>Tu respuesta:</strong>
                <span>{{ resp.texto }}</span>
                @if (resp.es_correcta) {
                  <mat-icon class="ok">check_circle</mat-icon>
                } @else {
                  <mat-icon class="err">cancel</mat-icon>
                }
              </div>
              @if (resp.retroalimentacion) {
                <p class="retro">💡 {{ resp.retroalimentacion }}</p>
              }
              @if (!resp.es_correcta && d.respuestas_correctas.length > 0) {
                <div class="correctas">
                  <strong>Respuesta(s) correcta(s):</strong>
                  <ul>
                    @for (c of d.respuestas_correctas; track c.id) {
                      <li>{{ c.texto }}
                        @if (c.justificacion) { <span class="just">— {{ c.justificacion }}</span> }
                      </li>
                    }
                  </ul>
                </div>
              }
            } @else {
              @if (d.respuestas_correctas.length > 0) {
                <div class="correctas">
                  <strong>Respuesta(s) correcta(s):</strong>
                  <ul>
                    @for (c of d.respuestas_correctas; track c.id) {
                      <li>{{ c.texto }}</li>
                    }
                  </ul>
                </div>
              }
            }
          </mat-card>
        }

        <div class="actions">
          <button mat-flat-button color="primary" (click)="salir()">
            <mat-icon>logout</mat-icon> Cerrar sesión
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 800px; margin: 0 auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

    .resumen { padding: 2rem; text-align: center; }
    .nota { display: flex; justify-content: center; margin-bottom: 1rem; }
    .circulo {
      width: 140px; height: 140px; border-radius: 50%;
      background: conic-gradient(var(--mat-sys-primary) var(--pct), var(--mat-sys-surface-container) 0);
      display: flex; align-items: center; justify-content: center; flex-direction: column;
      position: relative;
    }
    .circulo::before {
      content: ''; position: absolute;
      inset: 8px; border-radius: 50%; background: var(--mat-sys-surface);
    }
    .valor, .max { position: relative; z-index: 1; }
    .valor { font-size: 2rem; font-weight: 600; color: var(--mat-sys-primary); }
    .max { font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }

    .header h1 { margin: 0; font-size: 1.4rem; }
    .header .caso { margin: 0.25rem 0 0; color: var(--mat-sys-on-surface-variant); }

    .stats { display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
    .stat mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    .ok { color: var(--mat-sys-primary); }
    .err { color: var(--mat-sys-error); }
    .ne { color: var(--mat-sys-on-surface-variant); }

    .feedback {
      margin-top: 1.5rem; padding: 1rem; background: var(--mat-sys-surface-container);
      border-radius: 8px; text-align: left;
      h3 { margin: 0 0 0.5rem; font-size: 1rem; }
      p { margin: 0; }
    }

    .seccion-titulo { margin: 1rem 0 0; font-size: 1.2rem; font-weight: 500; }

    .pregunta-card {
      padding: 1.25rem;
      border-left: 4px solid var(--mat-sys-outline-variant);
      &.correcta { border-left-color: var(--mat-sys-primary); }
      &.incorrecta { border-left-color: var(--mat-sys-error); }
      &.no-respondida { border-left-color: var(--mat-sys-on-surface-variant); opacity: 0.85; }

      h3 { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 500; }
      .status { color: var(--mat-sys-on-surface-variant); margin: 0; }
      .tu-respuesta {
        display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
        padding: 0.5rem 0; border-bottom: 1px dashed var(--mat-sys-outline-variant);
        margin-bottom: 0.5rem;
      }
      .retro {
        margin: 0.5rem 0; padding: 0.5rem 0.75rem;
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
        border-radius: 6px;
      }
      .correctas {
        margin-top: 0.5rem;
        ul { margin: 0.25rem 0 0; padding-left: 1.25rem; }
        .just { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; }
      }
    }

    .actions { display: flex; justify-content: center; margin: 1.5rem 0; button { display: inline-flex; align-items: center; gap: 0.4rem; } }
  `],
})
export class ResultadoEstudiante implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicio = inject(SimulacionService);

  readonly loading = signal(true);
  readonly resultado = signal<Resultado | null>(null);
  readonly porcentaje = computed(() => {
    const r = this.resultado();
    if (!r) return 0;
    return Math.round(Number(r.nota_final));
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/estudiante']); return; }
    this.servicio.obtenerResultado(id).subscribe({
      next: (r) => { this.resultado.set(r); this.loading.set(false); },
      error: () => { this.router.navigate(['/estudiante']); },
    });
  }

  salir() {
    localStorage.clear();
    this.router.navigate(['/estudiante']);
  }
}
