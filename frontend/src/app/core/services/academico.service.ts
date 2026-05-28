import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AgregarPorCorreoInput,
  Estudiante,
  EstudianteInput,
  Grupo,
  GrupoDetalle,
  GrupoInput,
  Paginated,
} from '../models/academico.model';

@Injectable({ providedIn: 'root' })
export class AcademicoService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // ---------- Estudiantes ----------

  listarEstudiantes(page = 1): Observable<Paginated<Estudiante>> {
    return this.http.get<Paginated<Estudiante>>(`${this.api}/estudiantes/?page=${page}`);
  }

  crearEstudiante(data: EstudianteInput): Observable<Estudiante> {
    return this.http.post<Estudiante>(`${this.api}/estudiantes/`, data);
  }

  agregarPorCorreo(data: AgregarPorCorreoInput): Observable<Estudiante> {
    return this.http.post<Estudiante>(`${this.api}/estudiantes/agregar-por-correo/`, data);
  }

  actualizarEstudiante(id: number, data: Partial<EstudianteInput>): Observable<Estudiante> {
    return this.http.patch<Estudiante>(`${this.api}/estudiantes/${id}/`, data);
  }

  desvincularEstudiante(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/estudiantes/${id}/desvincular/`);
  }

  // ---------- Grupos ----------

  listarGrupos(page = 1): Observable<Paginated<Grupo>> {
    return this.http.get<Paginated<Grupo>>(`${this.api}/grupos/?page=${page}`);
  }

  obtenerGrupo(id: number): Observable<GrupoDetalle> {
    return this.http.get<GrupoDetalle>(`${this.api}/grupos/${id}/`);
  }

  crearGrupo(data: GrupoInput): Observable<Grupo> {
    return this.http.post<Grupo>(`${this.api}/grupos/`, data);
  }

  actualizarGrupo(id: number, data: Partial<GrupoInput>): Observable<Grupo> {
    return this.http.patch<Grupo>(`${this.api}/grupos/${id}/`, data);
  }

  eliminarGrupo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/grupos/${id}/`);
  }

  agregarEstudiantesAGrupo(grupoId: number, estudianteIds: number[]): Observable<GrupoDetalle> {
    return this.http.post<GrupoDetalle>(
      `${this.api}/grupos/${grupoId}/agregar-estudiantes/`,
      { estudiante_ids: estudianteIds },
    );
  }

  removerEstudiantesDeGrupo(grupoId: number, estudianteIds: number[]): Observable<GrupoDetalle> {
    return this.http.post<GrupoDetalle>(
      `${this.api}/grupos/${grupoId}/remover-estudiantes/`,
      { estudiante_ids: estudianteIds },
    );
  }
}
