import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Paginated } from '../models/academico.model';
import {
  CasoDetalle,
  CasoInput,
  CasoListItem,
  Escenario,
  EscenarioInput,
  Pregunta,
  PreguntaInput,
  Respuesta,
  RespuestaInput,
} from '../models/casos.model';

@Injectable({ providedIn: 'root' })
export class CasosService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // Casos
  listarCasos(page = 1) { return this.http.get<Paginated<CasoListItem>>(`${this.api}/casos/?page=${page}`); }
  obtenerCaso(id: number): Observable<CasoDetalle> { return this.http.get<CasoDetalle>(`${this.api}/casos/${id}/`); }
  crearCaso(data: CasoInput) { return this.http.post<CasoListItem>(`${this.api}/casos/`, data); }
  actualizarCaso(id: number, data: Partial<CasoInput>) { return this.http.patch<CasoListItem>(`${this.api}/casos/${id}/`, data); }
  eliminarCaso(id: number) { return this.http.delete<void>(`${this.api}/casos/${id}/`); }

  // Escenarios
  crearEscenario(data: EscenarioInput) { return this.http.post<Escenario>(`${this.api}/escenarios/`, data); }
  actualizarEscenario(id: number, data: Partial<EscenarioInput>) { return this.http.patch<Escenario>(`${this.api}/escenarios/${id}/`, data); }
  eliminarEscenario(id: number) { return this.http.delete<void>(`${this.api}/escenarios/${id}/`); }

  // Preguntas
  crearPregunta(data: PreguntaInput) { return this.http.post<Pregunta>(`${this.api}/preguntas/`, data); }
  actualizarPregunta(id: number, data: Partial<PreguntaInput>) { return this.http.patch<Pregunta>(`${this.api}/preguntas/${id}/`, data); }
  eliminarPregunta(id: number) { return this.http.delete<void>(`${this.api}/preguntas/${id}/`); }

  // Respuestas
  crearRespuesta(data: RespuestaInput) { return this.http.post<Respuesta>(`${this.api}/respuestas/`, data); }
  actualizarRespuesta(id: number, data: Partial<RespuestaInput>) { return this.http.patch<Respuesta>(`${this.api}/respuestas/${id}/`, data); }
  eliminarRespuesta(id: number) { return this.http.delete<void>(`${this.api}/respuestas/${id}/`); }
}
