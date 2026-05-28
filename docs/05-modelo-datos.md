# 05 — Modelo de datos

> Documento vivo. Se completa con diagrama ER a medida que cada app define sus modelos. Esta versión inicial describe las **entidades principales** del dominio y sus relaciones lógicas.

## Diagrama lógico (alto nivel)

```
Usuario ──< Estudiante                          Caso ──< Storytelling
   │            │                                 │
   │            │                                 ├──< Escenario ──< Pregunta ──< Respuesta
   │            └──< InscripcionGrupo >── Grupo   │                                  │
   │                                              ├──< Rubrica                       │
Practica ──< AutorizacionEstudiante               │                                  │
    │                                             └──< ArchivoFuente (opc.)          │
    ├──< Participacion ──< RespuestaSeleccionada >─────────────────────────────────┘
    │           │
    │           └──< Resultado
    └── Caso
```

## Entidades principales

### App `usuarios`

- **Usuario** (`AbstractUser` extendido)
  - `email` (único, indispensable)
  - `rol` (`ADMIN`, `DOCENTE`, `ESTUDIANTE`)
  - `nombre`, `apellido`
  - Campos heredados de `AbstractUser` (username, password, etc.)

### App `academico`

- **Estudiante**
  - `usuario` (FK opc. a `Usuario` — puede no tener cuenta tradicional)
  - `correo`, `nombre`, `apellido`
  - `docente_creador` (FK `Usuario` rol=DOCENTE)
- **Grupo**
  - `nombre`, `descripcion`
  - `docente` (FK `Usuario`)
- **InscripcionGrupo** (M:N entre `Estudiante` y `Grupo`)

### App `casos`

- **Caso**
  - `nombre`, `descripcion`, `desarrollo_situacional`, `contexto_historia`
  - `area_psicosocial`, `tiempo_estimado_min`
  - `estado` (`BORRADOR`, `IMPORTADO`, `GENERADO_IA`, `EN_REVISION`, `VALIDADO`, `SIN_INICIAR`, `EN_CURSO`, `FINALIZADO`, `ARCHIVADO`)
  - `docente_creador` (FK)
  - `archivo_fuente` (FK opc. a `importacion_documentos.ArchivoFuente`)
  - `fecha_creacion`
- **Storytelling** (1:1 con `Caso`)
  - Contenido narrativo, recursos, navegación
- **Escenario** (FK `Caso`)
  - `orden`, `titulo`, `narrativa`, `recursos_multimedia`
- **Pregunta** (FK `Escenario`)
  - `enunciado`, `tipo`, `orden`
- **Respuesta** (FK `Pregunta`)
  - `texto`, `es_correcta`, `justificacion`, `retroalimentacion`
- **Rubrica** (1:1 con `Caso`)
  - Criterios, pesos, escala

### App `importacion_documentos`

- **ArchivoFuente**
  - `archivo` (FileField), `tipo` (PDF, DOCX, TXT), `texto_extraido` (opc.)
  - `estado` (`SUBIDO`, `PROCESADO`, `CONVERTIDO_A_CASO`, `RECHAZADO`)
  - `docente` (FK)

### App `practicas`

- **Practica**
  - `caso` (FK), `docente` (FK)
  - `fecha_inicio`, `fecha_fin`, `tiempo_max_min`
  - `lugar_fisico` (opc.), `mensaje_personalizado`
  - `estado` (`SIN_INICIAR`, `EN_CURSO`, `FINALIZADA`, `CANCELADA`)
- **AutorizacionEstudiante** (M:N entre `Practica` y `Estudiante`)
  - `codigo_acceso` (único por estudiante por práctica)
  - `notificado`, `reintento_autorizado`

### App `participaciones`

- **Participacion**
  - `practica`, `estudiante`, `inicio`, `fin`, `tiempo_usado`
  - `estado` (`NO_INICIADA`, `EN_CURSO`, `FINALIZADA`, `INCOMPLETA`)
- **RespuestaSeleccionada**
  - `participacion`, `pregunta`, `respuesta_elegida`
  - `timestamp`, `cambiada` (bool)

### App `resultados`

- **Resultado**
  - `participacion` (1:1)
  - `correctas`, `incorrectas`, `nota_final`
  - `feedback_docente`, `notificado_estudiante`

### App `reportes`

- No tiene modelos propios. Genera vistas y exportaciones agregando datos de las demás apps.

## Notas

- Todas las migraciones se versionan (no se ignoran en `.gitignore`).
- Los enums de estado se definen como `TextChoices` en cada modelo.
- Todo modelo con `docente`/`docente_creador` exige filtrado por dueño en los `QuerySet` (regla RN04: cada docente ve solo lo suyo).
- El diagrama ER definitivo se generará con [dbdiagram.io](https://dbdiagram.io) o `django-extensions graph_models` y se guardará en [`../entregables/diagramas/`](../entregables/diagramas/).
