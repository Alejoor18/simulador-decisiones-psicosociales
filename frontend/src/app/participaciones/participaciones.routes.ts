import { Routes } from '@angular/router';

export const PARTICIPACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./participaciones').then((m) => m.Participaciones),
  },
];
