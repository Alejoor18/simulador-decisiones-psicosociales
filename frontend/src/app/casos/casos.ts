import { Component } from '@angular/core';

@Component({
  selector: 'app-casos',
  template: `
    <div class="placeholder">
      <h1>Casos de Estudio</h1>
      <p>Listado, creación manual, IA, importación desde PDF, escenarios, preguntas, rúbricas.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Casos {}
