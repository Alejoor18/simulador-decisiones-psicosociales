import { Routes } from '@angular/router';

export const GRUPOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./grupos').then((m) => m.Grupos),
    title: 'Grupos · Simulador',
  },
];
