/** Modelos TypeScript alineados con apps.academico del backend. */

export interface Estudiante {
  id: number;
  correo: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  activo: boolean;
  docente_creador: number;
  docente_creador_username: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  /** Solo presente en respuesta de agregar-por-correo: true si se creó, false si ya existía. */
  _creado?: boolean;
}

export interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
  docente: number;
  estudiantes_count: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface GrupoDetalle extends Grupo {
  estudiantes: Estudiante[];
}

/** Estructura estándar de paginación de DRF. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Payload para crear/editar Estudiante directamente. */
export interface EstudianteInput {
  correo: string;
  first_name: string;
  last_name: string;
  activo?: boolean;
}

/** Payload para agregar/vincular por correo. */
export interface AgregarPorCorreoInput {
  correo: string;
  first_name?: string;
  last_name?: string;
}

/** Payload para crear/editar Grupo. */
export interface GrupoInput {
  nombre: string;
  descripcion: string;
}
