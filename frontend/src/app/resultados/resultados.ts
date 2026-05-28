import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { Resultado } from '../core/models/practicas.model';
import { SimulacionService } from '../core/services/simulacion.service';

@Component({
  selector: 'app-resultados',
  imports: [
    CommonModule, FormsModule, DatePipe,
    MatTableModule, MatCardModule, MatButtonModule, MatIconModule,
    MatExpansionModule, MatFormFieldModule, MatInputModule,
    MatProgressBarModule, MatSnackBarModule,
  ],
  template: `
    <section class="page">
      <header>
        <h1>Resultados</h1>
        <p class="subtitle">Calificaciones por participación. Haz click para ver el detalle y dejar feedback.</p>
      </header>

      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

      @if (!loading() && resultados().length === 0) {
        <p class="empty">Aún no hay resultados. Los estudiantes deben completar sus prácticas primero.</p>
      }

      <mat-accordion>
        @for (r of resultados(); track r.id) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                {{ r.estudiante_nombre }} ({{ r.estudiante_correo }})
              </mat-panel-title>
              <mat-panel-description>
                {{ r.practica_nombre }} · <strong>{{ r.nota_final }}/100</strong> ·
                {{ r.correctas }}✓ {{ r.incorrectas }}✗ {{ r.no_respondidas }}—
              </mat-panel-description>
            </mat-expansion-panel-header>

            <p class="meta">Calculado: {{ r.fecha_calculo | date:'medium' }} · Peso obtenido: {{ r.peso_obtenido }}/{{ r.peso_total }}</p>

            <h3>Detalle pregunta por pregunta</h3>
            <ul class="detalle">
              @for (d of r.detalle_preguntas; track d.pregunta_id; let i = $index) {
                <li>
                  <strong>{{ i + 1 }}. {{ d.enunciado }}</strong> (peso {{ d.peso }})
                  @if (d.respondida && d.respuesta_elegida) {
                    <div [class.ok]="d.respuesta_elegida.es_correcta" [class.err]="!d.respuesta_elegida.es_correcta">
                      Eligió: {{ d.respuesta_elegida.texto }}
                      @if (d.respuesta_elegida.es_correcta) { ✓ } @else { ✗ }
                    </div>
                  } @else {
                    <div class="ne">No respondió</div>
                  }
                </li>
              }
            </ul>

            <h3>Feedback docente</h3>
            <mat-form-field appearance="outline" class="feedback">
              <textarea matInput rows="3" [(ngModel)]="feedbackEdit[r.id]"
                [placeholder]="r.feedback_docente || 'Escribe tu feedback aquí…'"></textarea>
            </mat-form-field>
            <button mat-flat-button color="primary" (click)="guardarFeedback(r)">
              <mat-icon>save</mat-icon> Guardar feedback
            </button>
          </mat-expansion-panel>
        }
      </mat-accordion>
    </section>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 500; }
    .subtitle { color: var(--mat-sys-on-surface-variant); margin: 0.25rem 0 0; font-size: 0.9rem; }
    .empty { padding: 2rem; text-align: center; color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-container); border-radius: 12px; margin: 0; }
    .meta { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; margin: 0.5rem 0; }
    h3 { font-size: 1rem; font-weight: 500; margin: 1rem 0 0.5rem; }
    .detalle { padding-left: 1.25rem; }
    .detalle li { margin-bottom: 0.5rem; }
    .ok { color: var(--mat-sys-primary); }
    .err { color: var(--mat-sys-error); }
    .ne { color: var(--mat-sys-on-surface-variant); font-style: italic; }
    .feedback { width: 100%; }
    button { display: inline-flex; align-items: center; gap: 0.4rem; }
  `],
})
export class Resultados implements OnInit {
  private readonly servicio = inject(SimulacionService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly resultados = signal<Resultado[]>([]);
  readonly feedbackEdit: Record<number, string> = {};

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.servicio.listarResultados().subscribe({
      next: (r) => {
        this.resultados.set(r.results);
        for (const res of r.results) this.feedbackEdit[res.id] = res.feedback_docente;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  guardarFeedback(r: Resultado) {
    const fb = this.feedbackEdit[r.id] ?? '';
    this.servicio.guardarFeedback(r.id, fb).subscribe({
      next: () => this.snackBar.open('Feedback guardado.', 'OK', { duration: 2500 }),
      error: () => this.snackBar.open('No se pudo guardar.', 'OK', { duration: 3500 }),
    });
  }
}
