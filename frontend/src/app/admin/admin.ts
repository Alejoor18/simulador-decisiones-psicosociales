import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  template: `
    <div class="placeholder">
      <h1>Panel de Administrador</h1>
      <p>Métricas generales, docentes, estudiantes, casos, prácticas, reportes.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Admin {}
