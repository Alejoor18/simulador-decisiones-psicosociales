import { Routes } from '@angular/router';

export const CASOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./casos').then((m) => m.Casos),
  },
];
