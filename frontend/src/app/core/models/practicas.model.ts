/** Modelos TS para Practicas, Participaciones y Resultados. */

import { CasoDetalle, Pregunta, Respuesta } from './casos.model';

export enum EstadoPractica {
  SinIniciar = 'SIN_INICIAR',
  EnCurso = 'EN_CURSO',
  Finalizada = 'FINALIZADA',
  Cancelada = 'CANCELADA',
}

export enum EstadoParticipacion {
  NoIniciada = 'NO_INICIADA',
  EnCurso = 'EN_CURSO',
  Finalizada = 'FINALIZADA',
  Incompleta = 'INCOMPLETA',
}

export interface Autorizacion {
  id: number;
  practica: number;
  estudiante: number;
  estudiante_correo: string;
  estudiante_nombre: string;
  codigo_acceso: string;
  notificado: boolean;
  reintento_autorizado: boolean;
  fecha_creacion: string;
}

export interface Practica {
  id: number;
  nombre: string;
  caso: number;
  caso_nombre: string;
  docente: number;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_max_min: number;
  lugar_fisico: string;
  mensaje_personalizado: string;
  estado: EstadoPractica;
  estado_display: string;
  autorizaciones_count: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PracticaDetalle extends Practica {
  autorizaciones: Autorizacion[];
}

export interface PracticaInput {
  nombre: string;
  caso: number;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_max_min?: number;
  lugar_fisico?: string;
  mensaje_personalizado?: string;
}

// ---- Acceso estudiante ----

export interface AccesoEstudianteRespuesta {
  access: string;
  refresh: string;
  estudiante: { id: number; correo: string; nombre_completo: string };
  practica: {
    id: number;
    nombre: string;
    caso_id: number;
    caso_nombre: string;
    tiempo_max_min: number;
    fecha_inicio: string;
    fecha_fin: string;
    mensaje_personalizado: string;
    estado: EstadoPractica;
  };
  autorizacion_id: number;
}

// ---- Participaciones ----

export interface RespuestaSeleccionada {
  id: number;
  participacion: number;
  pregunta: number;
  respuesta_elegida: number;
  timestamp: string;
}

export interface Participacion {
  id: number;
  practica: number;
  practica_nombre: string;
  estudiante: number;
  estudiante_correo: string;
  estudiante_nombre: string;
  autorizacion: number;
  inicio: string | null;
  fin: string | null;
  tiempo_usado_seg: number;
  estado: EstadoParticipacion;
  estado_display: string;
  respuestas_seleccionadas: RespuestaSeleccionada[];
  caso?: CasoDetalle;
}

export interface ProgresoParticipacion {
  participacion_id: number;
  estado: EstadoParticipacion;
  total_preguntas: number;
  respondidas: number;
  tiempo_usado_seg: number;
}

// ---- Resultados ----

export interface DetallePreguntaResultado {
  pregunta_id: number;
  enunciado: string;
  peso: number;
  respondida: boolean;
  respuesta_elegida: Respuesta | null;
  respuestas_correctas: Respuesta[];
}

export interface Resultado {
  id: number;
  participacion: number;
  estudiante_correo: string;
  estudiante_nombre: string;
  practica_id: number;
  practica_nombre: string;
  caso_nombre: string;
  correctas: number;
  incorrectas: number;
  no_respondidas: number;
  peso_obtenido: number;
  peso_total: number;
  nota_final: string;
  feedback_docente: string;
  notificado_estudiante: boolean;
  fecha_calculo: string;
  fecha_actualizacion: string;
  detalle_preguntas: DetallePreguntaResultado[];
}
