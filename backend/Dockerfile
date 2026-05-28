# =========================================================
# Backend: Django + DRF
# Imagen base: Python 3.11 slim (ligera, estable, compatible con psycopg2)
# =========================================================
FROM python:3.11-slim

# ---------- Variables de entorno de Python ----------
# PYTHONDONTWRITEBYTECODE: no generar .pyc dentro del contenedor
# PYTHONUNBUFFERED: logs en tiempo real (no se quedan en buffer)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# ---------- Dependencias del sistema ----------
# build-essential + libpq-dev: necesarios para compilar psycopg2 si hiciera falta
# curl: útil para healthchecks
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# ---------- Directorio de trabajo ----------
WORKDIR /app

# ---------- Instalación de dependencias Python ----------
# Copiamos primero requirements.txt para aprovechar la caché de Docker:
# si requirements no cambia, no se reinstalan los paquetes.
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# ---------- Copia del código ----------
# En desarrollo este COPY se sobreescribe con el bind-mount de docker-compose,
# pero queda en la imagen para que sirva también para producción.
COPY . /app/

# ---------- Puerto expuesto ----------
EXPOSE 8000

# ---------- Comando por defecto ----------
# Para desarrollo: runserver con autoreload.
# En producción se sobreescribe con: gunicorn config.wsgi:application --bind 0.0.0.0:8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
