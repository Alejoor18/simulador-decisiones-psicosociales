import { Routes } from '@angular/router';

export const DOCENTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./docente').then((m) => m.Docente),
  },
];
