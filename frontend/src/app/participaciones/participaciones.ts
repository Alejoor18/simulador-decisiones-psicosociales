import { Component } from '@angular/core';

@Component({
  selector: 'app-participaciones',
  template: `
    <div class="placeholder">
      <h1>Participaciones</h1>
      <p>Simulación interactiva del estudiante: storytelling, escenarios, preguntas, temporizador.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Participaciones {}
