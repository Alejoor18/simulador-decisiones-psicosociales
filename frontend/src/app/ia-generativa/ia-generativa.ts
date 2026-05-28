import { Component } from '@angular/core';

@Component({
  selector: 'app-ia-generativa',
  template: `
    <div class="placeholder">
      <h1>IA Generativa</h1>
      <p>Generación asistida de casos, storytelling, escenarios, preguntas, respuestas, rúbricas.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class IaGenerativa {}
