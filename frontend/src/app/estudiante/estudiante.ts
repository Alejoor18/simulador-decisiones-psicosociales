import { Component } from '@angular/core';

@Component({
  selector: 'app-estudiante',
  template: `
    <div class="placeholder">
      <h1>Acceso de Estudiante</h1>
      <p>Acceso con correo y código de autorización, vista de práctica asignada.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class Estudiante {}
