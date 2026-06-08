import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import {
  PracticaEstudianteActiva,
  PracticaEstudianteRegistro,
  ProgresoPracticaLocal,
  EstadoPracticaEstudiante,
} from '../models/estudiante-session.model';
import { AccesoEstudianteRespuesta } from '../models/practicas.model';
import { Rol } from '../models/usuario.model';
import { resolverCasoNarrativoId } from '../utils/caso-narrativo.util';

const PRACTICA_ACTIVA_KEY = 'simulador.practica_activa';
const PRACTICAS_KEY = 'simulador.practicas_estudiante';
const USER_KEY = 'simulador.user';

@Injectable({ providedIn: 'root' })
export class EstudianteSessionService {
  private readonly auth = inject(AuthService);
  private readonly _practicas = signal<PracticaEstudianteRegistro[]>(this.cargarPracticas());

  readonly practicas = this._practicas.asReadonly();

  readonly practicaActiva = computed(() => {
    const raw = localStorage.getItem(PRACTICA_ACTIVA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PracticaEstudianteActiva;
    } catch {
      return null;
    }
  });

  readonly autenticado = computed(() => this.tieneSesionEstudianteValida());

  readonly nombreEstudiante = computed(() => {
    const u = this.auth.usuario();
    if (u?.nombre_completo) return u.nombre_completo;
    if (u?.email) return u.email;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return 'Estudiante';
    try {
      const legacy = JSON.parse(raw) as { nombre_completo?: string; email?: string };
      return legacy.nombre_completo || legacy.email || 'Estudiante';
    } catch {
      return 'Estudiante';
    }
  });

  estudianteId(): number | null {
    const u = this.auth.usuario();
    if (typeof u?.id === 'number') return u.id;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const legacy = JSON.parse(raw) as { id?: number };
      return typeof legacy.id === 'number' ? legacy.id : null;
    } catch {
      return null;
    }
  }

  registrarAcceso(respuesta: AccesoEstudianteRespuesta): void {
    this.auth.establecerSesionEstudiante(respuesta);

    const practica: PracticaEstudianteActiva = {
      ...respuesta.practica,
      autorizacion_id: respuesta.autorizacion_id,
    };
    localStorage.setItem(PRACTICA_ACTIVA_KEY, JSON.stringify(practica));
    this.upsertPractica(practica, respuesta.autorizacion_id);
  }

  obtenerPractica(id: number): PracticaEstudianteRegistro | undefined {
    return this._practicas().find((p) => p.id === id);
  }

  seleccionarPractica(id: number): void {
    const practica = this.obtenerPractica(id);
    if (!practica) return;
    localStorage.setItem(PRACTICA_ACTIVA_KEY, JSON.stringify(practica));
  }

  guardarProgreso(
    practicaId: number,
    datos: {
      conversacionesCompletadas: number;
      conversacionesTotales: number;
      resultadoId?: number;
    },
  ): void {
    const lista = [...this._practicas()];
    const idx = lista.findIndex((p) => p.id === practicaId);
    if (idx < 0) return;

    const practica = lista[idx];
    const casoNarrativoId = resolverCasoNarrativoId(practica);
    const porcentaje =
      datos.conversacionesTotales > 0
        ? Math.round((datos.conversacionesCompletadas / datos.conversacionesTotales) * 100)
        : practica.progreso.porcentaje;

    let estado: EstadoPracticaEstudiante = 'en_progreso';
    if (datos.resultadoId) {
      estado = 'completada';
    } else if (porcentaje === 0) {
      estado = 'no_iniciada';
    }

    const progreso: ProgresoPracticaLocal = {
      practicaId,
      casoNarrativoId,
      porcentaje,
      estado,
      ultimaActividad: new Date().toISOString(),
      conversacionesCompletadas: datos.conversacionesCompletadas,
      conversacionesTotales: datos.conversacionesTotales,
      resultadoId: datos.resultadoId ?? practica.progreso.resultadoId,
    };

    lista[idx] = { ...practica, progreso };
    this.persistirPracticas(lista);
  }

  marcarEnProgreso(practicaId: number): void {
    const lista = [...this._practicas()];
    const idx = lista.findIndex((p) => p.id === practicaId);
    if (idx < 0) return;

    const practica = lista[idx];
    if (practica.progreso.estado === 'completada') return;

    lista[idx] = {
      ...practica,
      progreso: {
        ...practica.progreso,
        estado: 'en_progreso',
        ultimaActividad: new Date().toISOString(),
      },
    };
    this.persistirPracticas(lista);
  }

  /** Elimina tokens inválidos o sesiones que no son de estudiante. */
  invalidarSiNecesario(): void {
    const token = this.auth.getAccessToken();
    if (!token) return;

    if (!this.tieneSesionEstudianteValida()) {
      this.cerrarSesion();
    }
  }

  private tieneSesionEstudianteValida(): boolean {
    if (!this.auth.isAuthenticated()) return false;

    const rol = this.auth.rol();
    const legacy = this.rolLegacyEnStorage();
    return rol === Rol.Estudiante || legacy === Rol.Estudiante || legacy === 'Estudiante';
  }

  cerrarSesion(): void {
    this.auth.clearLocalSession();
  }

  private rolLegacyEnStorage(): string | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw) as { rol?: string };
      return u.rol ?? null;
    } catch {
      return null;
    }
  }

  private upsertPractica(practica: PracticaEstudianteActiva, autorizacionId: number): void {
    const lista = [...this._practicas()];
    const idx = lista.findIndex((p) => p.id === practica.id);
    const casoNarrativoId = resolverCasoNarrativoId(practica);

    if (idx >= 0) {
      lista[idx] = {
        ...lista[idx],
        ...practica,
        autorizacion_id: autorizacionId,
      };
    } else {
      lista.push({
        ...practica,
        autorizacion_id: autorizacionId,
        progreso: {
          practicaId: practica.id,
          casoNarrativoId,
          porcentaje: 0,
          estado: 'no_iniciada',
          ultimaActividad: practica.fecha_inicio,
          conversacionesCompletadas: 0,
          conversacionesTotales: 0,
        },
      });
    }

    this.persistirPracticas(lista);
  }

  private cargarPracticas(): PracticaEstudianteRegistro[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(PRACTICAS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as PracticaEstudianteRegistro[];
    } catch {
      return [];
    }
  }

  private persistirPracticas(lista: PracticaEstudianteRegistro[]): void {
    this._practicas.set(lista);
    localStorage.setItem(PRACTICAS_KEY, JSON.stringify(lista));
  }
}
