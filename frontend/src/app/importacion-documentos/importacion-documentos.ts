import { Component } from '@angular/core';

@Component({
  selector: 'app-importacion-documentos',
  template: `
    <div class="placeholder">
      <h1>Importación de Documentos</h1>
      <p>Subida de PDF/DOCX, extracción de texto, propuesta de estructura del caso.</p>
      <p class="note">Módulo en construcción.</p>
    </div>
  `,
  styles: [
    `.placeholder { padding: 2rem; }
     .note { color: var(--mat-sys-on-surface-variant); font-style: italic; }`,
  ],
})
export class ImportacionDocumentos {}
