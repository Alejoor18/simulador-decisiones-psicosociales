import { Routes } from '@angular/router';

export const IMPORTACION_DOCUMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./importacion-documentos').then((m) => m.ImportacionDocumentos),
  },
];
