# 02 — Requerimientos Funcionales

Listado completo de los requerimientos funcionales (RF) del sistema. Cada RF debe ser verificable mediante una prueba concreta sobre la API o sobre el frontend.

## Autenticación y roles

| ID | Descripción |
|---|---|
| RF01 | El sistema debe permitir el registro autónomo de docentes. |
| RF02 | El sistema debe permitir el inicio de sesión de docentes y administrador. |
| RF03 | El sistema debe identificar el rol del usuario y mostrar las funciones permitidas. |

## Administrador

| ID | Descripción |
|---|---|
| RF04 | El administrador debe poder consultar docentes, estudiantes, casos, prácticas, resultados y métricas generales. |
| RF44 | El administrador debe poder consultar reportes y métricas generales. |

## Gestión académica (docente)

| ID | Descripción |
|---|---|
| RF05 | El docente debe poder registrar, editar, importar y organizar estudiantes. |
| RF06 | El docente debe poder agregar estudiantes mediante correo electrónico. |
| RF07 | El docente debe poder vincular estudiantes a través de su correo electrónico. |
| RF08 | El docente debe poder crear grupos académicos. |
| RF09 | El docente debe poder asociar estudiantes a grupos académicos. |

## Casos de estudio

| ID | Descripción |
|---|---|
| RF10 | El docente debe poder crear casos de estudio manualmente. |
| RF11 | El docente debe poder generar casos de estudio con asistencia de IA. |
| RF12 | El docente debe poder importar casos de estudio desde PDF o documento. |
| RF13 | El sistema debe poder almacenar y procesar archivos de casos subidos por el docente. |
| RF14 | El sistema debe permitir revisar, editar y aprobar contenido importado desde archivo. |
| RF15 | El docente debe poder revisar, editar y aprobar contenido generado por IA. |
| RF16 | El docente debe poder crear una historia/contexto tipo storytelling para el caso. |
| RF17 | El docente debe poder crear escenarios narrativos. |
| RF18 | El docente debe poder crear escenarios dentro de un caso. |
| RF19 | El docente debe poder asociar recursos multimedia a escenarios. |
| RF20 | El docente debe poder crear preguntas dentro de escenarios. |
| RF21 | El docente debe poder crear respuestas por pregunta. |
| RF22 | El docente debe poder marcar respuestas correctas e incorrectas. |
| RF23 | El docente debe poder agregar justificación y retroalimentación por respuesta. |
| RF24 | El docente debe poder crear rúbricas de calificación. |

## Prácticas académicas

| ID | Descripción |
|---|---|
| RF25 | El docente debe poder agendar prácticas académicas. |
| RF26 | El docente debe poder asociar estudiantes o grupos a una práctica. |
| RF27 | El sistema debe generar códigos de autorización para estudiantes. |
| RF28 | El sistema debe notificar a estudiantes autorizados. |
| RF29 | El docente debe poder iniciar la práctica. |
| RF45 | El sistema debe permitir finalizar una práctica académica. |
| RF46 | El sistema debe impedir participación en prácticas finalizadas. |
| RF49 | El sistema debe permitir que el docente autorice una nueva participación de un estudiante que ya participó. |

## Participación del estudiante

| ID | Descripción |
|---|---|
| RF30 | El estudiante debe poder acceder mediante correo y código de autorización. |
| RF31 | El sistema debe validar que el estudiante esté autorizado. |
| RF32 | El sistema debe impedir participación fuera del tiempo permitido. |
| RF33 | El sistema debe impedir doble participación no autorizada. |
| RF34 | El estudiante debe poder responder preguntas. |
| RF35 | El estudiante debe poder cambiar respuestas antes de finalizar. |
| RF36 | El sistema debe registrar respuestas, progreso, tiempo e intentos. |

## Resultados

| ID | Descripción |
|---|---|
| RF37 | El sistema debe calcular la calificación final. |
| RF38 | El sistema debe mostrar retroalimentación solo al finalizar. |
| RF39 | El docente debe poder consultar resultados por estudiante. |
| RF40 | El docente debe poder agregar feedback general. |
| RF41 | El estudiante debe poder consultar nota y retroalimentación. |
| RF42 | El sistema debe notificar la nota final al estudiante. |
| RF47 | El sistema debe calcular nota cero para estudiantes que no participaron. |
| RF48 | El sistema debe calcular nota parcial para estudiantes que iniciaron pero no finalizaron. |

## Reportes

| ID | Descripción |
|---|---|
| RF43 | El docente debe poder descargar reportes. |

## Plataforma y arquitectura

| ID | Descripción |
|---|---|
| RF50 | El frontend debe consumir todos los datos mediante API REST. |
| RF51 | El frontend debe ser responsivo. |
| RF52 | El frontend debe estar preparado para despliegue. |
| RF53 | El backend debe estar preparado para despliegue. |
| RF54 | El sistema debe manejar variables de entorno para datos sensibles. |
| RF55 | El sistema debe permitir configurar URL de API para desarrollo y producción. |
| RF56 | El backend debe usar PostgreSQL desde el inicio. |
| RF57 | El backend y PostgreSQL deben poder levantarse con Docker Compose. |
| RF58 | El sistema debe estar preparado para incorporar animaciones o recursos multimedia en la experiencia narrativa más adelante. |
