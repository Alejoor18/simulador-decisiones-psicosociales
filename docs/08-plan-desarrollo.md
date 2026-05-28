# 08 — Plan de desarrollo

Orden lógico de implementación. Cada paso debe completarse en una rama `feature/*` e integrarse a `develop` mediante Pull Request.

## Fase 0 — Setup inicial

1. Revisar repositorio y confirmar ramas `main` y `develop`.
2. Crear estructura inicial de carpetas.
3. Crear documentación inicial en `docs/`.
4. Crear `docker-compose.yml`.
5. Crear `backend/Dockerfile`.
6. Configurar PostgreSQL con Docker Compose.
7. Crear backend con Django y Django REST Framework.
8. Configurar conexión a PostgreSQL desde el inicio.
9. Configurar variables de entorno.
10. Configurar CORS.
11. Configurar JWT.
12. Crear apps principales del backend.
13. Crear frontend Angular dentro de `frontend/`.
14. Configurar Angular Router.
15. Configurar Angular Material.
16. Crear environments de Angular.
17. Crear base visual responsiva.

## Fase 1 — Autenticación y roles

18. Crear autenticación backend (modelo `Usuario` custom, JWT, registro docente).
19. Crear autenticación frontend (login, registro docente, guards).
20. Crear registro docente.
21. Crear paneles por rol (admin, docente, estudiante).

## Fase 2 — Gestión académica

22. Crear gestión de estudiantes.
23. Crear vinculación de estudiantes por correo electrónico.
24. Crear gestión de grupos académicos.

## Fase 3 — Casos de estudio

25. Crear casos manualmente (CRUD).
26. Crear importación desde PDF/documento (subida + almacenamiento).
27. Crear módulo de IA generativa (integración con LLM).
28. Crear storytelling del caso.
29. Crear escenarios narrativos.
30. Crear preguntas, respuestas y rúbricas.

## Fase 4 — Prácticas y participación

31. Crear prácticas académicas (agendamiento).
32. Crear códigos de autorización + notificaciones.
33. Crear acceso del estudiante con correo + código.
34. Crear flujo de participación (simulación interactiva).
35. Crear temporizador y barra de progreso.

## Fase 5 — Resultados y reportes

36. Crear cálculo de resultados.
37. Crear retroalimentación final.
38. Crear reportes.

## Fase 6 — Despliegue

39. Probar reglas de negocio end-to-end.
40. Preparar backend para despliegue.
41. Preparar frontend para despliegue.
42. Documentar instalación, ejecución y despliegue.

## MVP obligatorio

La primera versión funcional debe incluir, como mínimo:

- Backend Django + DRF, PostgreSQL, Docker Compose.
- Frontend Angular, API REST funcionando, responsivo.
- Registro de docentes, login, roles básicos, panel docente y administrador.
- Registro de estudiantes (manual y por correo), grupos.
- Creación de caso de estudio manual, importación básica desde PDF (al menos guardar archivo y revisión).
- Historia/contexto, vista inicial de storytelling.
- Escenarios, preguntas, respuestas con marcación de correcta, retroalimentación.
- Rúbrica básica.
- Agendamiento de práctica, generación de código, acceso estudiante.
- Participación del estudiante, guardado de respuestas, cálculo de calificación.
- Resumen final, reporte básico para docente.
- Backend y frontend preparados para despliegue.
