import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PracticaEstudianteRegistro, EstadoPracticaEstudiante } from '../../core/models/estudiante-session.model';
import { EstudianteSessionService } from '../../core/services/estudiante-session.service';
import { EstudianteShellComponent } from '../estudiante-shell/estudiante-shell';

@Component({
  selector: 'app-panel-estudiante',
  imports: [RouterLink, EstudianteShellComponent],
  templateUrl: './panel-estudiante.html',
  styleUrl: './panel-estudiante.scss',
})
export class PanelEstudianteComponent {
  private readonly session = inject(EstudianteSessionService);
  private readonly router = inject(Router);

  readonly nombre = this.session.nombreEstudiante;
  readonly practicas = this.session.practicas;

  readonly primerNombre = computed(() => {
    const nombre = this.nombre();
    return nombre.trim().split(/\s+/)[0] || 'Estudiante';
  });

  readonly metaLinea = computed(() => {
    const lista = this.practicas();
    if (!lista.length) return 'Estudiante · Simulador psicosocial';
    const caso = lista[0].caso_nombre;
    return `${caso} · Práctica asignada`;
  });

  readonly pendientes = computed(() =>
    this.practicas().filter((p) => p.progreso.estado === 'no_iniciada'),
  );

  readonly enCurso = computed(() => {
    const activa = this.practicas().find((p) => p.progreso.estado === 'en_progreso');
    return activa ?? null;
  });

  readonly resumen = computed(() => {
    const lista = this.practicas();
    return {
      pendientes: lista.filter((p) => p.progreso.estado === 'no_iniciada').length,
      enCurso: lista.filter((p) => p.progreso.estado === 'en_progreso').length,
      completadas: lista.filter((p) => p.progreso.estado === 'completada').length,
    };
  });

  promedioDisplay(): string {
    const completadas = this.practicas().filter((p) => p.progreso.estado === 'completada');
    if (!completadas.length) return '—';
    return '—';
  }

  metaPractica(p: PracticaEstudianteRegistro): string {
    const inicio = new Date(p.fecha_inicio).toLocaleDateString('es-CO');
    return `${p.nombre} · ${inicio} · ${p.tiempo_max_min} min`;
  }

  etiquetaAccion(estado: EstadoPracticaEstudiante): string {
    if (estado === 'en_progreso') return 'Continuar';
    if (estado === 'completada') return 'Ver resultado';
    return 'Iniciar';
  }

  accionPractica(p: PracticaEstudianteRegistro): void {
    if (p.progreso.estado === 'en_progreso') {
      this.continuarSimulacion(p.id);
      return;
    }
    if (p.progreso.estado === 'completada' && p.progreso.resultadoId) {
      this.router.navigate(['/estudiante/resultado', p.progreso.resultadoId]);
      return;
    }
    this.abrirPractica(p.id);
  }

  abrirPractica(practicaId: number): void {
    this.session.seleccionarPractica(practicaId);
    this.router.navigate(['/estudiante/practicas', practicaId]);
  }

  continuarSimulacion(practicaId: number): void {
    this.session.seleccionarPractica(practicaId);
    this.router.navigate(['/estudiante/practicas', practicaId, 'simulacion']);
  }
}
