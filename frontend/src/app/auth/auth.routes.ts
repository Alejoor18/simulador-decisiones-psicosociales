import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth').then((m) => m.Auth),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login').then((m) => m.Login),
        title: 'Iniciar sesión · Simulador',
      },
      {
        path: 'registro-docente',
        loadComponent: () =>
          import('./registro-docente/registro-docente').then((m) => m.RegistroDocente),
        title: 'Registro de docente · Simulador',
      },
    ],
  },
];
