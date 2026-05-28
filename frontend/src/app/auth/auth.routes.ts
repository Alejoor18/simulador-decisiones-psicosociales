import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth').then((m) => m.Auth),
    children: [
      // TODO: agregar login, registro-docente, acceso-estudiante (fase de autenticación)
    ],
  },
];
