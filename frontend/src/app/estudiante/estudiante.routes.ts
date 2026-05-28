import { Routes } from '@angular/router';

export const ESTUDIANTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./estudiante').then((m) => m.Estudiante),
    title: 'Acceso estudiante · Simulador',
  },
  {
    path: 'simulacion',
    loadComponent: () => import('./simulacion').then((m) => m.Simulacion),
    title: 'Simulación · Simulador',
  },
  {
    path: 'resultado/:id',
    loadComponent: () => import('./resultado').then((m) => m.ResultadoEstudiante),
    title: 'Resultado · Simulador',
  },
];
