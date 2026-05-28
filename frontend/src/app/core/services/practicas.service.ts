import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Paginated } from '../models/academico.model';
import {
  AccesoEstudianteRespuesta,
  Practica,
  PracticaDetalle,
  PracticaInput,
} from '../models/practicas.model';

@Injectable({ providedIn: 'root' })
export class PracticasService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(page = 1) { return this.http.get<Paginated<Practica>>(`${this.api}/practicas/?page=${page}`); }
  obtener(id: number) { return this.http.get<PracticaDetalle>(`${this.api}/practicas/${id}/`); }
  crear(data: PracticaInput) { return this.http.post<Practica>(`${this.api}/practicas/`, data); }
  actualizar(id: number, data: Partial<PracticaInput>) { return this.http.patch<Practica>(`${this.api}/practicas/${id}/`, data); }
  eliminar(id: number) { return this.http.delete<void>(`${this.api}/practicas/${id}/`); }

  autorizarEstudiantes(id: number, estudiante_ids: number[] = [], grupo_ids: number[] = []) {
    return this.http.post<{ creadas: number; autorizaciones: unknown[] }>(
      `${this.api}/practicas/${id}/autorizar-estudiantes/`,
      { estudiante_ids, grupo_ids },
    );
  }

  iniciar(id: number) { return this.http.post<PracticaDetalle>(`${this.api}/practicas/${id}/iniciar/`, {}); }
  finalizar(id: number) { return this.http.post<PracticaDetalle>(`${this.api}/practicas/${id}/finalizar/`, {}); }

  // Acceso publico estudiante
  accesoEstudiante(correo: string, codigo: string) {
    return this.http.post<AccesoEstudianteRespuesta>(`${this.api}/auth/estudiante-acceso/`, { correo, codigo });
  }
}
