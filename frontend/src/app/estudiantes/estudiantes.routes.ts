import { Routes } from '@angular/router';

export const ESTUDIANTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./estudiantes').then((m) => m.Estudiantes),
    title: 'Estudiantes · Simulador',
  },
];
