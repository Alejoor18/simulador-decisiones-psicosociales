import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reportes').then((m) => m.Reportes),
  },
];
