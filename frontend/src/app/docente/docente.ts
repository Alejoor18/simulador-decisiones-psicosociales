import { Component } from '@angular/core';

@Component({
  selector: 'app-docente',
  template: `
    <div class="placeholder">
      <h1>Panel de Docente</h1>
      <p>Gestión de estudiantes, grupos, casos, prácticas, resultados.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Docente {}
