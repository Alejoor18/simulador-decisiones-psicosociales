import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ExtrasService } from '../core/services/extras.service';

@Component({
  selector: 'app-ia-generativa',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressBarModule, MatSnackBarModule,
  ],
  template: `
    <section class="page">
      <header>
        <h1>Generación de caso con IA</h1>
        <p class="subtitle">
          Genera un caso base (estructura completa: escenarios, preguntas, respuestas)
          a partir de un tema. El caso queda en estado <strong>"Generado por IA"</strong>
          para que lo revises y edites antes de usarlo en una práctica.
        </p>
      </header>

      <mat-card class="card">
        @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
        <form [formGroup]="form" (ngSubmit)="generar()" class="form">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Tema del caso</mat-label>
            <input matInput formControlName="tema" required maxlength="200" />
            <mat-hint>Ej: "Conformidad social en entornos universitarios"</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Área psicosocial (opcional)</mat-label>
            <input matInput formControlName="area" maxlength="150" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Preguntas por escenario</mat-label>
            <mat-select formControlName="preguntas_por_escenario">
              <mat-option [value]="1">1</mat-option>
              <mat-option [value]="2">2</mat-option>
              <mat-option [value]="3">3</mat-option>
              <mat-option [value]="4">4</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            <mat-icon>auto_awesome</mat-icon> Generar caso
          </button>
        </form>

        <div class="aviso">
          <mat-icon>info</mat-icon>
          <span>
            La generación actual es un esqueleto plausible (stub). Cuando configures
            <code>OPENAI_API_KEY</code> o <code>ANTHROPIC_API_KEY</code> en el
            <code>.env</code>, el backend usará el LLM real (pendiente de elegir provider).
          </span>
        </div>
      </mat-card>
    </section>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; max-width: 720px; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 500; }
    .subtitle { margin: 0.25rem 0 0; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
    .card { padding: 1.5rem; }
    .form { display: flex; flex-direction: column; gap: 0.5rem; }
    .full { width: 100%; }
    button { display: inline-flex; align-items: center; gap: 0.4rem; align-self: flex-start; padding: 0.5rem 1rem; }
    .aviso {
      margin-top: 1rem; display: flex; gap: 0.5rem;
      padding: 0.75rem 1rem; background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container); border-radius: 8px;
      font-size: 0.85rem;
      code { background: rgba(0,0,0,0.1); padding: 0 0.25rem; border-radius: 4px; }
    }
  `],
})
export class IaGenerativa {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(ExtrasService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly form = this.fb.nonNullable.group({
    tema: ['', [Validators.required, Validators.maxLength(200)]],
    area: [''],
    preguntas_por_escenario: [2],
  });

  generar() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const v = this.form.getRawValue();
    this.servicio.generarCasoIA(v.tema, v.area, v.preguntas_por_escenario).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.snackBar.open(`Caso "${res.nombre}" generado. Editando…`, 'OK', { duration: 3000 });
        this.router.navigate(['/casos', res.caso_id]);
      },
      error: () => { this.loading.set(false); this.snackBar.open('No se pudo generar.', 'OK', { duration: 3500 }); },
    });
  }
}
