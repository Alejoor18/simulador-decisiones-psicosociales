import { Routes } from '@angular/router';

/**
 * Rutas raíz de la aplicación.
 * Todas las secciones se cargan con lazy loading para optimizar el bundle inicial.
 * Los guards y la redirección por rol se agregarán en la fase B7 (auth).
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'docente',
    pathMatch: 'full',
  },

  // ---------- Autenticación (públicas) ----------
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'estudiante',
    loadChildren: () =>
      import('./estudiante/estudiante.routes').then((m) => m.ESTUDIANTE_ROUTES),
  },

  // ---------- Paneles principales ----------
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'docente',
    loadChildren: () => import('./docente/docente.routes').then((m) => m.DOCENTE_ROUTES),
  },

  // ---------- Módulos funcionales (docente) ----------
  {
    path: 'casos',
    loadChildren: () => import('./casos/casos.routes').then((m) => m.CASOS_ROUTES),
  },
  {
    path: 'ia-generativa',
    loadChildren: () =>
      import('./ia-generativa/ia-generativa.routes').then((m) => m.IA_GENERATIVA_ROUTES),
  },
  {
    path: 'importacion-documentos',
    loadChildren: () =>
      import('./importacion-documentos/importacion-documentos.routes').then(
        (m) => m.IMPORTACION_DOCUMENTOS_ROUTES,
      ),
  },
  {
    path: 'practicas',
    loadChildren: () =>
      import('./practicas/practicas.routes').then((m) => m.PRACTICAS_ROUTES),
  },
  {
    path: 'participaciones',
    loadChildren: () =>
      import('./participaciones/participaciones.routes').then(
        (m) => m.PARTICIPACIONES_ROUTES,
      ),
  },
  {
    path: 'resultados',
    loadChildren: () =>
      import('./resultados/resultados.routes').then((m) => m.RESULTADOS_ROUTES),
  },
  {
    path: 'reportes',
    loadChildren: () =>
      import('./reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
  },

  // ---------- Fallback ----------
  {
    path: '**',
    redirectTo: 'docente',
  },
];
