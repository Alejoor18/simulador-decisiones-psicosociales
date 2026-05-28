import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';

/**
 * Añade el header `Authorization: Bearer <access>` a peticiones salientes
 * cuando el usuario tiene un token de acceso vigente.
 *
 * Excepciones:
 * - Endpoints públicos (token/, token/refresh/, registro-docente/, estudiante-acceso/, health/)
 *   no necesitan token y se dejan pasar sin tocar.
 * - Cualquier URL que no apunte al backend del simulador tampoco se modifica.
 */
const PUBLIC_PATHS = [
  '/auth/token/',
  '/auth/token/refresh/',
  '/auth/token/verify/',
  '/auth/registro-docente/',
  '/auth/estudiante-acceso/',
  '/health/',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isPublic = PUBLIC_PATHS.some((path) => req.url.includes(path));
  if (isPublic) {
    return next(req);
  }

  const token = auth.getAccessToken();
  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(cloned);
};
