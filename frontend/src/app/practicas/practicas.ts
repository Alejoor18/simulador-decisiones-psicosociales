import { Component } from '@angular/core';

@Component({
  selector: 'app-practicas',
  template: `
    <div class="placeholder">
      <h1>Prácticas Académicas</h1>
      <p>Agendamiento, autorización de estudiantes, generación de códigos de acceso.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Practicas {}
