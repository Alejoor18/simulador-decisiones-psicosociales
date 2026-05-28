import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Rol } from './core/models/usuario.model';
import { MainLayout } from './shared/layouts/main-layout/main-layout';

/**
 * Rutas raíz de la aplicación.
 *
 * Estructura:
 * - /auth/*       → públicas, sin sidenav (componente Auth con su propio layout).
 * - /estudiante/* → pública (acceso con código), sin sidenav todavía.
 * - resto         → protegidas con authGuard, envueltas en MainLayout (toolbar + sidenav).
 *                   El roleGuard filtra el acceso por rol cuando hace falta.
 */
export const routes: Routes = [
  // ---------- Rutas públicas ----------
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'estudiante',
    loadChildren: () =>
      import('./estudiante/estudiante.routes').then((m) => m.ESTUDIANTE_ROUTES),
  },

  // ---------- Rutas protegidas (envueltas en MainLayout) ----------
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'docente',
        pathMatch: 'full',
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Admin] },
      },
      {
        path: 'docente',
        loadChildren: () =>
          import('./docente/docente.routes').then((m) => m.DOCENTE_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente] },
      },
      {
        path: 'estudiantes',
        loadChildren: () =>
          import('./estudiantes/estudiantes.routes').then((m) => m.ESTUDIANTES_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente, Rol.Admin] },
      },
      {
        path: 'grupos',
        loadChildren: () => import('./grupos/grupos.routes').then((m) => m.GRUPOS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente, Rol.Admin] },
      },
      {
        path: 'casos',
        loadChildren: () => import('./casos/casos.routes').then((m) => m.CASOS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente, Rol.Admin] },
      },
      {
        path: 'ia-generativa',
        loadChildren: () =>
          import('./ia-generativa/ia-generativa.routes').then((m) => m.IA_GENERATIVA_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente] },
      },
      {
        path: 'importacion-documentos',
        loadChildren: () =>
          import('./importacion-documentos/importacion-documentos.routes').then(
            (m) => m.IMPORTACION_DOCUMENTOS_ROUTES,
          ),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente] },
      },
      {
        path: 'practicas',
        loadChildren: () =>
          import('./practicas/practicas.routes').then((m) => m.PRACTICAS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente, Rol.Admin] },
      },
      {
        path: 'participaciones',
        loadChildren: () =>
          import('./participaciones/participaciones.routes').then(
            (m) => m.PARTICIPACIONES_ROUTES,
          ),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente, Rol.Estudiante] },
      },
      {
        path: 'resultados',
        loadChildren: () =>
          import('./resultados/resultados.routes').then((m) => m.RESULTADOS_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente, Rol.Estudiante, Rol.Admin] },
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
        canActivate: [roleGuard],
        data: { roles: [Rol.Docente, Rol.Admin] },
      },
    ],
  },

  // ---------- Fallback ----------
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
