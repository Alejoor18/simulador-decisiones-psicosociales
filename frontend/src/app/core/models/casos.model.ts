/** Modelos TS alineados con apps.casos del backend. */

export enum EstadoCaso {
  Borrador = 'BORRADOR',
  Importado = 'IMPORTADO',
  GeneradoIA = 'GENERADO_IA',
  EnRevision = 'EN_REVISION',
  Validado = 'VALIDADO',
  Archivado = 'ARCHIVADO',
}

export interface Respuesta {
  id: number;
  pregunta: number;
  orden: number;
  texto: string;
  es_correcta: boolean;
  justificacion: string;
  retroalimentacion: string;
}

export interface Pregunta {
  id: number;
  escenario: number;
  orden: number;
  enunciado: string;
  peso: number;
  respuestas: Respuesta[];
}

export interface Escenario {
  id: number;
  caso: number;
  orden: number;
  titulo: string;
  narrativa: string;
  recursos_multimedia: string[];
  preguntas: Pregunta[];
}

export interface Rubrica {
  id: number;
  caso: number;
  descripcion: string;
  escala_maxima: number;
  criterios: { nombre: string; peso: number; descripcion?: string }[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CasoListItem {
  id: number;
  nombre: string;
  descripcion: string;
  area_psicosocial: string;
  tiempo_estimado_min: number;
  estado: EstadoCaso;
  estado_display: string;
  docente_creador: number;
  docente_creador_username: string;
  escenarios_count: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CasoDetalle extends CasoListItem {
  desarrollo_situacional: string;
  contexto_historia: string;
  escenarios: Escenario[];
  rubrica?: Rubrica | null;
}

export interface CasoInput {
  nombre: string;
  descripcion?: string;
  desarrollo_situacional?: string;
  contexto_historia?: string;
  area_psicosocial?: string;
  tiempo_estimado_min?: number;
  estado?: EstadoCaso;
}

export interface EscenarioInput {
  caso: number;
  orden: number;
  titulo: string;
  narrativa?: string;
  recursos_multimedia?: string[];
}

export interface PreguntaInput {
  escenario: number;
  orden: number;
  enunciado: string;
  peso?: number;
}

export interface RespuestaInput {
  pregunta: number;
  orden: number;
  texto: string;
  es_correcta?: boolean;
  justificacion?: string;
  retroalimentacion?: string;
}
