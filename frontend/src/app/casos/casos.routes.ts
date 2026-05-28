import { Routes } from '@angular/router';

export const CASOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./casos').then((m) => m.Casos),
    title: 'Casos · Simulador',
  },
  {
    path: ':id',
    loadComponent: () => import('./caso-detalle').then((m) => m.CasoDetallePage),
    title: 'Editor de caso · Simulador',
  },
];
