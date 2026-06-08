import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { EstudianteSessionService } from '../../core/services/estudiante-session.service';

export const estudianteAuthGuard: CanActivateFn = () => {
  const session = inject(EstudianteSessionService);
  const router = inject(Router);

  session.invalidarSiNecesario();

  if (session.autenticado()) {
    return true;
  }

  return router.createUrlTree(['/estudiante']);
};
