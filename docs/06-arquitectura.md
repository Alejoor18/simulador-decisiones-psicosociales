# 06 — Arquitectura

## Visión general

Arquitectura **cliente-servidor** desacoplada con dos despliegues independientes:

```
┌──────────────────────┐   HTTPS/JSON   ┌──────────────────────┐   TCP    ┌──────────────────┐
│  Cliente Angular     │ ──────────────► │  API Django + DRF    │ ───────► │  PostgreSQL      │
│  - Standalone comp.  │   JWT Bearer    │  - Apps modulares    │  psyc.   │  - Datos negocio │
│  - Angular Material  │ ◄────────────── │  - Permisos por rol  │ ◄─────── │  - Volumen persist.
└──────────────────────┘                 └──────────────────────┘          └──────────────────┘
        ng serve                              docker compose                     docker compose
        Vercel/Netlify (prod)                 Render/Railway (prod)              gestionado en prod
```

## Capas del backend

```
backend/
├── config/                  # configuración del proyecto Django
│   ├── settings.py          # apps, middleware, JWT, CORS, DB
│   ├── urls.py              # ruteo raíz: /api/auth, /api/casos, ...
│   ├── wsgi.py / asgi.py    # entrada para servidor de producción
│
└── apps/                    # lógica de dominio, una app por bounded context
    ├── usuarios/            # auth, roles, perfiles
    ├── academico/           # estudiantes, grupos
    ├── casos/               # casos, escenarios, preguntas, respuestas, rúbricas
    ├── ia_generativa/       # integración con OpenAI/Anthropic
    ├── importacion_documentos/  # PDFs, DOCX, extracción
    ├── practicas/           # agendamiento, autorización, códigos
    ├── participaciones/     # ejecución de la simulación
    ├── resultados/          # cálculo de notas, retroalimentación
    └── reportes/            # exportaciones, métricas admin
```

Cada app contiene: `models.py`, `serializers.py`, `views.py` (o `viewsets.py`), `urls.py`, `admin.py`, `services.py` (lógica de negocio compleja), `permissions.py` (autorizaciones específicas).

## Capas del frontend

```
frontend/src/app/
├── core/                # singletons: interceptors, guards, auth service
├── shared/              # componentes y utilidades reutilizables
├── auth/                # login, registro docente, acceso estudiante
├── admin/               # panel administrador
├── docente/             # panel docente
├── estudiante/          # panel estudiante
├── casos/               # CRUD casos, storytelling, escenarios, preguntas
├── ia-generativa/       # asistente IA
├── importacion-documentos/  # subida y procesamiento PDF
├── practicas/           # agendamiento, códigos
├── participaciones/     # simulación interactiva
├── resultados/          # resumen, calificación, feedback
└── reportes/            # listados, descarga
```

Cada módulo es **standalone** con su propio archivo de rutas (`*.routes.ts`) y se carga con `loadChildren` (lazy loading) desde `app.routes.ts`.

## Comunicación frontend ↔ backend

- **Protocolo**: HTTPS (en producción), HTTP (local).
- **Formato**: JSON.
- **Autenticación**: JWT Bearer en header `Authorization`.
- **CORS**: backend autoriza solo orígenes listados en `CORS_ALLOWED_ORIGINS`.
- **Interceptor Angular** añade el token y maneja `401` (refresh automático o redirect a login).

## Decisiones arquitectónicas clave

| Decisión | Razón |
|---|---|
| Frontend y backend separados | Despliegues independientes, mejor escalado, equipo puede trabajar en paralelo. |
| PostgreSQL desde inicio (no SQLite) | Comportamiento de tipos/transacciones idéntico a producción. |
| Custom `Usuario` con campo `rol` | Permite filtrado y permisos por rol sin tabla aparte. Debe definirse antes de `migrate`. |
| Apps Django por bounded context | Modularidad, baja acoplamiento, facilita extracción a microservicios si crece. |
| Standalone components Angular | Estilo moderno, menos boilerplate que NgModules, lazy loading nativo. |
| Angular Material | Componentes ricos out-of-the-box, accesibilidad, theming. |
| Docker Compose para backend + DB | Reproducibilidad total del entorno entre desarrolladores. |
| Variables de entorno con `python-decouple` | Secretos fuera del código, distinción dev/prod sin código condicional. |

## Despliegue (alto nivel)

Ver [`09-despliegue.md`](./09-despliegue.md) para los detalles.

- **Backend** → Render / Railway con PostgreSQL gestionado.
- **Frontend** → Vercel / Netlify (build estático de Angular).
- **CI/CD** → GitHub Actions (futuro).
