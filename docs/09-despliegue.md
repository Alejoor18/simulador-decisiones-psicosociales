# 09 — Despliegue

> Documento vivo. Se completa con detalles concretos cuando lleguemos a la fase de despliegue. Esta versión establece la estrategia general.

## Estrategia

Frontend y backend se despliegan **por separado**, en plataformas distintas:

- **Backend (Django + DRF + PostgreSQL)** → Render o Railway.
- **Frontend (Angular)** → Vercel o Netlify.

## Backend en Render / Railway

### Preparación

- `Dockerfile` ya listo en `backend/`.
- `requirements.txt` con `gunicorn` para servir en producción.
- `whitenoise` para servir estáticos del admin.
- `settings.py` lee variables desde el entorno (no usa `.env` local en prod, sino las variables que configures en el panel de la plataforma).

### Variables de entorno a configurar en la plataforma

```text
SECRET_KEY=<generar nueva, NO reutilizar la de desarrollo>
DEBUG=False
ALLOWED_HOSTS=<dominio.render.com>
POSTGRES_DB=<provisto por Render/Railway>
POSTGRES_USER=<provisto>
POSTGRES_PASSWORD=<provisto>
POSTGRES_HOST=<provisto>
POSTGRES_PORT=5432
CORS_ALLOWED_ORIGINS=https://<dominio-frontend>.vercel.app
JWT_ACCESS_LIFETIME_MIN=60
JWT_REFRESH_LIFETIME_DAYS=7
OPENAI_API_KEY=<clave real>
EMAIL_HOST_USER=<si se usa correo>
EMAIL_HOST_PASSWORD=<si se usa correo>
```

### Comando de arranque (sin Docker)

Si la plataforma compila el `Dockerfile` directamente, usa el `CMD` del Dockerfile. Si la plataforma requiere comando explícito:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

### Migraciones en producción

Configurar un build/release command:

```bash
python manage.py migrate --noinput && python manage.py collectstatic --noinput
```

### Base de datos PostgreSQL

- Render: agregar un servicio "PostgreSQL" y vincular sus env vars al backend.
- Railway: agregar plugin "PostgreSQL" y usar las variables `PGHOST`, `PGUSER`, etc.

## Frontend en Vercel / Netlify

### Preparación

- `frontend/src/environments/environment.prod.ts` debe apuntar a la URL pública del backend:
  ```ts
  export const environment = {
    production: true,
    apiUrl: 'https://<backend>.render.com/api'
  };
  ```

### Build command

```bash
cd frontend && npm install && npm run build -- --configuration production
```

### Output directory

```text
frontend/dist/<nombre-proyecto>/browser
```
(el path exacto depende de la versión de Angular).

### Rutas SPA (rewrite a `index.html`)

Vercel/Netlify deben servir `index.html` para cualquier ruta no encontrada (Angular maneja el routing del lado del cliente).

- **Netlify**: crear `frontend/public/_redirects` con `/*  /index.html  200`.
- **Vercel**: crear `frontend/vercel.json` con rewrite de `/(.*)` → `/index.html`.

## CORS en producción

Cuando se conozca la URL del frontend desplegado, actualizar `CORS_ALLOWED_ORIGINS` en el backend y redeploy.

## Checklist final antes de publicar

- [ ] `DEBUG=False` en producción.
- [ ] `SECRET_KEY` nueva (no la de desarrollo).
- [ ] `ALLOWED_HOSTS` con el dominio real.
- [ ] `CORS_ALLOWED_ORIGINS` con el dominio del frontend desplegado.
- [ ] Base de datos PostgreSQL gestionada (no SQLite, no PostgreSQL local).
- [ ] Migraciones aplicadas (`python manage.py migrate`).
- [ ] `collectstatic` ejecutado.
- [ ] Superusuario administrador creado.
- [ ] HTTPS habilitado (la plataforma suele proveerlo automáticamente).
- [ ] `environment.prod.ts` del frontend apunta a la URL del backend.
- [ ] Build de Angular sin errores.
- [ ] Rewrite SPA configurado.
- [ ] Flujo end-to-end probado en producción (registro docente, login, crear caso, participar como estudiante).
