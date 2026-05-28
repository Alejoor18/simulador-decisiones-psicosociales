import { Routes } from '@angular/router';

export const IA_GENERATIVA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ia-generativa').then((m) => m.IaGenerativa),
  },
];
