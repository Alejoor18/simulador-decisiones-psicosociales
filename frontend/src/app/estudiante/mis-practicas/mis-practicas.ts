import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { EstadoPracticaEstudiante, PracticaEstudianteRegistro } from '../../core/models/estudiante-session.model';
import { EstudianteSessionService } from '../../core/services/estudiante-session.service';
import { EstudianteShellComponent } from '../estudiante-shell/estudiante-shell';

type VistaPracticas = 'todas' | 'pendientes' | 'curso' | 'completadas';

@Component({
  selector: 'app-mis-practicas',
  imports: [DatePipe, NgClass, RouterLink, EstudianteShellComponent],
  templateUrl: './mis-practicas.html',
  styleUrl: './mis-practicas.scss',
})
export class MisPracticasComponent {
  private readonly session = inject(EstudianteSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly practicas = this.session.practicas;
  readonly vista = signal<VistaPracticas>('todas');
  readonly busqueda = signal('');

  readonly vistas = [
    { id: 'todas' as const, label: 'Todas' },
    { id: 'pendientes' as const, label: 'Pendientes' },
    { id: 'curso' as const, label: 'En curso' },
    { id: 'completadas' as const, label: 'Completadas' },
  ];

  readonly filtradas = computed(() => {
    const v = this.vista();
    const q = this.busqueda().trim().toLowerCase();
    let items = this.practicas();

    if (v === 'pendientes') items = items.filter((p) => p.progreso.estado === 'no_iniciada');
    else if (v === 'curso') items = items.filter((p) => p.progreso.estado === 'en_progreso');
    else if (v === 'completadas') items = items.filter((p) => p.progreso.estado === 'completada');

    if (q) {
      items = items.filter((p) =>
        `${p.nombre} ${p.caso_nombre}`.toLowerCase().includes(q),
      );
    }

    return items;
  });

  readonly resumen = computed(() => {
    const lista = this.practicas();
    return {
      pendientes: lista.filter((p) => p.progreso.estado === 'no_iniciada').length,
      enCurso: lista.filter((p) => p.progreso.estado === 'en_progreso').length,
      completadas: lista.filter((p) => p.progreso.estado === 'completada').length,
    };
  });

  constructor() {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail ?? '';
      this.busqueda.set(detail);
    };
    window.addEventListener('estudiante-busqueda', handler);
    this.destroyRef.onDestroy(() => window.removeEventListener('estudiante-busqueda', handler));
  }

  tituloPractica(p: PracticaEstudianteRegistro): string {
    const caso = p.caso_nombre;
    return caso.length > 48 ? `${caso.slice(0, 48)}…` : caso;
  }

  etiquetaEstado(estado: EstadoPracticaEstudiante): string {
    switch (estado) {
      case 'completada':
        return 'Finalizado';
      case 'en_progreso':
        return 'En curso';
      default:
        return 'Sin iniciar';
    }
  }

  etiquetaAccion(estado: EstadoPracticaEstudiante): string {
    if (estado === 'en_progreso') return 'Continuar';
    if (estado === 'completada') return 'Ver resultado';
    return 'Iniciar';
  }

  badgeClase(estado: EstadoPracticaEstudiante): string {
    switch (estado) {
      case 'completada':
        return 'badge--finalizado';
      case 'en_progreso':
        return 'badge--en-curso';
      default:
        return 'badge--sin-iniciar';
    }
  }

  vistaLabel(): string {
    const map: Record<VistaPracticas, string> = {
      todas: 'asignadas',
      pendientes: 'pendientes',
      curso: 'en curso',
      completadas: 'completadas',
    };
    return map[this.vista()];
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
