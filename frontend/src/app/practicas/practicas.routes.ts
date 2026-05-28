import { Routes } from '@angular/router';

export const PRACTICAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./practicas').then((m) => m.Practicas),
  },
];
