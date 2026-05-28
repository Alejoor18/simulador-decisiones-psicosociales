import { Routes } from '@angular/router';

export const PRACTICAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./practicas').then((m) => m.Practicas),
    title: 'Prácticas · Simulador',
  },
  {
    path: ':id',
    loadComponent: () => import('./practica-detalle').then((m) => m.PracticaDetallePage),
    title: 'Detalle de práctica · Simulador',
  },
];
