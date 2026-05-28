import { Routes } from '@angular/router';

export const RESULTADOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./resultados').then((m) => m.Resultados),
  },
];
