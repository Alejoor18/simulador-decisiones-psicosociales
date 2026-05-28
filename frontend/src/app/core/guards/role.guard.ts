import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Rol } from '../models/usuario.model';

/**
 * Permite el acceso a la ruta solo si el rol del usuario está incluido en
 * `route.data['roles']`. Si no, redirige al dashboard que corresponda a su rol
 * (o a /auth si no hay sesión).
 *
 * Ejemplo de uso en una ruta:
 *   { path: 'admin', loadChildren: ..., canActivate: [authGuard, roleGuard], data: { roles: [Rol.Admin] } }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = (route.data['roles'] as Rol[] | undefined) ?? [];

  if (auth.hasRol(...allowed)) {
    return true;
  }

  // Si está autenticado pero con rol equivocado, lo enviamos a su dashboard natural.
  const rol = auth.rol();
  if (rol === Rol.Admin) return router.createUrlTree(['/admin']);
  if (rol === Rol.Docente) return router.createUrlTree(['/docente']);
  if (rol === Rol.Estudiante) return router.createUrlTree(['/estudiante']);

  return router.createUrlTree(['/auth']);
};
