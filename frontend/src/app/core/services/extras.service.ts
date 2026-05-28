import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AdminMetricas {
  docentes: number;
  estudiantes: number;
  grupos: number;
  casos: number;
  practicas: number;
  practicas_por_estado: Record<string, number>;
  resultados: number;
  nota_promedio: number;
}

export interface ArchivoFuente {
  id: number;
  archivo: string;
  nombre_original: string;
  tipo: 'PDF' | 'DOCX' | 'TXT';
  texto_extraido: string;
  estado: string;
  estado_display: string;
  docente: number;
  caso: number | null;
  fecha_subida: string;
}

@Injectable({ providedIn: 'root' })
export class ExtrasService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // ---- Admin ----
  adminMetricas() {
    return this.http.get<AdminMetricas>(`${this.api}/reportes/admin/metricas/`);
  }

  // ---- IA ----
  generarCasoIA(tema: string, area: string, preguntas_por_escenario = 2) {
    return this.http.post<{ caso_id: number; nombre: string }>(
      `${this.api}/ia/generar-caso/`,
      { tema, area, preguntas_por_escenario },
    );
  }

  // ---- Importación ----
  subirArchivo(file: File): Observable<ArchivoFuente> {
    const fd = new FormData();
    fd.append('archivo', file);
    return this.http.post<ArchivoFuente>(`${this.api}/importacion/`, fd);
  }
  procesarArchivo(id: number) {
    return this.http.post<ArchivoFuente>(`${this.api}/importacion/${id}/procesar/`, {});
  }
  crearCasoDesdeArchivo(id: number, nombre: string, area_psicosocial = '') {
    return this.http.post<{ caso_id: number; archivo: ArchivoFuente }>(
      `${this.api}/importacion/${id}/crear-caso/`,
      { nombre, area_psicosocial },
    );
  }

  // ---- Reportes (descargas) ----
  descargarReportePracticaPDF(practicaId: number) {
    return this.http.get(`${this.api}/reportes/practica/${practicaId}/pdf/`, { responseType: 'blob' });
  }
  descargarReportePracticaExcel(practicaId: number) {
    return this.http.get(`${this.api}/reportes/practica/${practicaId}/excel/`, { responseType: 'blob' });
  }
}
