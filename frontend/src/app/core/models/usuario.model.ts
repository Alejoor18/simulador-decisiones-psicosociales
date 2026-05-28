/**
 * Modelo de Usuario alineado con el backend (apps.usuarios.models.Usuario).
 * Los roles son los mismos definidos en `Usuario.Rol` del backend.
 */

export enum Rol {
  Admin = 'ADMIN',
  Docente = 'DOCENTE',
  Estudiante = 'ESTUDIANTE',
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  rol: Rol;
}

/** Respuesta del endpoint /api/auth/token/ de SimpleJWT. */
export interface TokenPair {
  access: string;
  refresh: string;
}

/** Claims que extrae el frontend del access token JWT. */
export interface JwtPayload {
  user_id: number;
  exp: number;
  iat: number;
  jti: string;
  token_type: 'access' | 'refresh';
}
