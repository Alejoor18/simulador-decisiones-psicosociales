/**
 * Configuración para DESARROLLO LOCAL.
 * El backend Django corre en http://localhost:8000 (Docker Compose).
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  appName: 'Simulador de Decisiones Psicosociales (dev)',
};
