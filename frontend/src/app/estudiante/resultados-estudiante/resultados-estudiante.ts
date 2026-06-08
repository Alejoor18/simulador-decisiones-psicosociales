import { Component } from '@angular/core';

import { Resultados } from '../../resultados/resultados';
import { EstudianteShellComponent } from '../estudiante-shell/estudiante-shell';

@Component({
  selector: 'app-estudiante-resultados',
  imports: [EstudianteShellComponent, Resultados],
  template: `
    <app-estudiante-shell>
      <app-resultados />
    </app-estudiante-shell>
  `,
})
export class EstudianteResultados {}
