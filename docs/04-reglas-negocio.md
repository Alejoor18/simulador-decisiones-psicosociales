# 04 — Reglas de negocio

Reglas que el **backend debe validar siempre**, aunque el frontend también las refuerce visualmente.

## Roles y registro

| ID | Regla |
|---|---|
| RN01 | El docente se registra por sí mismo en la plataforma. |
| RN02 | El administrador no registra docentes ni estudiantes. |
| RN03 | El administrador puede consultar toda la información general del sistema. |
| RN04 | El docente registra, vincula y administra sus propios estudiantes. |
| RN05 | El docente puede agregar estudiantes mediante correo electrónico. |
| RN06 | El correo electrónico será un dato clave para vincular estudiantes y enviar notificaciones. |

## Casos de estudio

| ID | Regla |
|---|---|
| RN07 | Solo docentes autenticados pueden crear casos de estudio. |
| RN08 | Todo caso debe tener estructura mínima: nombre, contexto, historia, escenarios, preguntas, respuestas y rúbrica. |
| RN09 | El caso debe poder presentarse como una experiencia narrativa tipo storytelling. |
| RN10 | Todo contenido generado por IA debe ser revisado y aprobado por el docente. |
| RN11 | Todo contenido importado desde PDF/documento debe ser revisado y aprobado por el docente. |
| RN29 | La IA actúa únicamente como asistente de creación, no como autoridad académica final. |

## Prácticas y participación

| ID | Regla |
|---|---|
| RN12 | Una práctica debe tener fecha y hora de inicio y finalización. |
| RN13 | El estudiante solo puede ingresar si está autorizado. |
| RN14 | El estudiante accede mediante correo y código de autorización. |
| RN15 | El estudiante no puede participar si el caso o práctica está finalizado. |
| RN16 | El estudiante no puede participar dos veces, salvo nueva autorización del docente. |
| RN17 | El estudiante no puede iniciar si ya pasó la mitad del tiempo permitido para iniciar la práctica. |
| RN18 | El estudiante puede cambiar respuestas antes de finalizar. |
| RN25 | Un caso finalizado no debe permitir nuevas participaciones. |
| RN26 | El docente puede agregar o quitar estudiantes autorizados y el estudiante debe ser notificado. |
| RN27 | El sistema debe cambiar automáticamente una práctica a finalizada si ya pasó su fecha y hora de finalización. |
| RN28 | El tiempo máximo de participación no debe superar el tiempo asignado al caso de estudio. |

## Retroalimentación y calificación

| ID | Regla |
|---|---|
| RN19 | La retroalimentación no se muestra pregunta por pregunta durante la práctica. |
| RN20 | La retroalimentación se muestra al finalizar. |
| RN21 | Si el estudiante no culmina, se califica hasta donde avanzó. |
| RN22 | Si el estudiante no participa, su nota será cero. |
| RN23 | El docente puede agregar feedback general. |
| RN24 | El estudiante debe ser notificado de su nota y feedback. |

## Plataforma y seguridad

| ID | Regla |
|---|---|
| RN30 | El frontend no debe acceder directamente a la base de datos. |
| RN31 | Toda comunicación entre frontend y backend debe hacerse mediante API REST. |
| RN32 | El frontend debe adaptarse a computador, tablet y celular. |
| RN33 | El backend debe validar todas las reglas importantes, aunque el frontend también tenga validaciones. |
| RN34 | Los datos sensibles deben manejarse mediante variables de entorno. |
| RN35 | La base de datos debe ser PostgreSQL desde el inicio. |
| RN36 | El backend y la base de datos deben poder levantarse con Docker Compose. |
