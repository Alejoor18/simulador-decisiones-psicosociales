import { Component } from '@angular/core';

@Component({
  selector: 'app-resultados',
  template: `
    <div class="placeholder">
      <h1>Resultados</h1>
      <p>Resumen final, calificación, retroalimentación, feedback docente.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Resultados {}
