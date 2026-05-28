# 07 — Endpoints de la API REST

Base URL en desarrollo: `http://localhost:8000/api/`

Todos los endpoints (excepto los marcados como **públicos**) requieren header `Authorization: Bearer <access_token>`.

## Autenticación

| Método | Ruta | Descripción | Público |
|---|---|---|:---:|
| POST | `/auth/registro-docente/` | Registro autónomo de docente | ✓ |
| POST | `/auth/token/` | Login: devuelve `access` + `refresh` (JWT) | ✓ |
| POST | `/auth/token/refresh/` | Renueva el `access` con el `refresh` | ✓ |
| POST | `/auth/token/verify/` | Verifica que un token sea válido | ✓ |
| POST | `/auth/logout/` | Invalida el refresh token | |
| GET | `/auth/perfil/` | Devuelve perfil del usuario logueado | |
| POST | `/auth/estudiante-acceso/` | Acceso del estudiante con `correo` + `codigo` | ✓ |
| GET | `/health/` | Healthcheck del backend | ✓ |

## Administrador

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/admin/metricas/` | Métricas generales del sistema |
| GET | `/admin/docentes/` | Listado de docentes |
| GET | `/admin/estudiantes/` | Listado de estudiantes |
| GET | `/admin/casos/` | Listado de casos |
| GET | `/admin/practicas/` | Listado de prácticas |
| GET | `/admin/reportes/` | Reportes generales |

## Académico (estudiantes y grupos)

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/estudiantes/` | Listar / crear estudiantes |
| POST | `/estudiantes/agregar-por-correo/` | Agregar estudiante por correo |
| POST | `/estudiantes/vincular-correo/` | Vincular estudiante existente por correo |
| GET/PUT/DELETE | `/estudiantes/{id}/` | Detalle / editar / eliminar |
| GET/POST | `/grupos/` | Listar / crear grupos |
| GET/PUT/DELETE | `/grupos/{id}/` | Detalle / editar / eliminar |

## Casos de estudio

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/casos/` | Listar / crear caso |
| GET/PUT/DELETE | `/casos/{id}/` | Detalle / editar / eliminar |
| POST | `/casos/{id}/validar/` | Validar estructura mínima |
| POST | `/casos/{id}/archivar/` | Archivar caso |

### Storytelling

| Método | Ruta |
|---|---|
| GET/POST/PUT | `/casos/{id}/storytelling/` |

### Escenarios

| Método | Ruta |
|---|---|
| GET/POST | `/casos/{id}/escenarios/` |
| GET/PUT/DELETE | `/escenarios/{id}/` |

### Preguntas

| Método | Ruta |
|---|---|
| GET/POST | `/escenarios/{id}/preguntas/` |
| GET/PUT/DELETE | `/preguntas/{id}/` |

### Respuestas

| Método | Ruta |
|---|---|
| GET/POST | `/preguntas/{id}/respuestas/` |
| GET/PUT/DELETE | `/respuestas/{id}/` |

### Rúbricas

| Método | Ruta |
|---|---|
| GET/POST | `/casos/{id}/rubrica/` |
| PUT/DELETE | `/rubricas/{id}/` |

## IA generativa

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/ia/generar-caso/` | Genera caso completo |
| POST | `/ia/generar-storytelling/` | Genera narrativa |
| POST | `/ia/generar-escenarios/` | Genera escenarios |
| POST | `/ia/generar-preguntas/` | Genera preguntas |
| POST | `/ia/generar-respuestas/` | Genera respuestas |
| POST | `/ia/generar-rubrica/` | Genera rúbrica |
| POST | `/ia/procesar-documento/` | Procesa documento subido |
| POST | `/ia/aprobar-contenido/` | Aprueba contenido generado |

## Importación de documentos

| Método | Ruta |
|---|---|
| POST | `/importacion/cargar-documento/` |
| GET | `/importacion/documentos/` |
| GET | `/importacion/documentos/{id}/` |
| POST | `/importacion/documentos/{id}/procesar/` |
| POST | `/importacion/documentos/{id}/crear-caso/` |

## Prácticas

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/practicas/` | Listar / crear |
| GET/PUT/DELETE | `/practicas/{id}/` | Detalle / editar / eliminar |
| POST | `/practicas/{id}/agregar-estudiantes/` | Asociar estudiantes |
| POST | `/practicas/{id}/generar-codigos/` | Generar códigos de acceso |
| POST | `/practicas/{id}/iniciar/` | Iniciar práctica |
| POST | `/practicas/{id}/finalizar/` | Finalizar práctica |
| POST | `/practicas/{id}/autorizar-reintento/` | Autorizar nueva participación |

## Participaciones

| Método | Ruta |
|---|---|
| POST | `/participaciones/iniciar/` |
| GET | `/participaciones/{id}/` |
| POST | `/participaciones/{id}/responder/` |
| POST | `/participaciones/{id}/finalizar/` |
| GET | `/participaciones/{id}/progreso/` |

## Resultados

| Método | Ruta |
|---|---|
| GET | `/resultados/` |
| GET | `/resultados/{id}/` |
| GET | `/resultados/estudiante/{id}/` |
| POST | `/resultados/{id}/feedback-docente/` |

## Reportes

| Método | Ruta |
|---|---|
| GET | `/reportes/practica/{id}/` |
| GET | `/reportes/caso/{id}/` |
| GET | `/reportes/grupo/{id}/` |
| GET | `/reportes/admin/` |

## Convenciones generales

- Respuestas JSON.
- Errores con códigos HTTP estándar (`400`, `401`, `403`, `404`, `409`, `500`).
- Paginación por defecto en listados (`?page=` y `?page_size=`).
- Filtros vía query params (`?docente=...`, `?estado=...`).
- Subida de archivos con `multipart/form-data`.
