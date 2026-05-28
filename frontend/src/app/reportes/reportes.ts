import { Component } from '@angular/core';

@Component({
  selector: 'app-reportes',
  template: `
    <div class="placeholder">
      <h1>Reportes</h1>
      <p>Reportes por práctica, estudiante, grupo, caso, métricas generales para admin.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Reportes {}
