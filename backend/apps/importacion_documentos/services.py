"""Servicios de extracción de texto desde archivos."""

from pathlib import Path

from pypdf import PdfReader


def extraer_texto(ruta: str | Path, tipo: str) -> str:
    """Extrae texto de un archivo. Soporta PDF; DOCX/TXT como fallback simple."""
    p = Path(ruta)
    if tipo == 'PDF':
        try:
            reader = PdfReader(str(p))
            return '\n\n'.join((page.extract_text() or '') for page in reader.pages).strip()
        except Exception as exc:
            return f'[Error al extraer PDF: {exc}]'
    if tipo == 'TXT':
        return p.read_text(encoding='utf-8', errors='replace')
    if tipo == 'DOCX':
        # Lectura simple sin python-docx (que no está en requirements).
        return '[DOCX no soportado todavía; instala python-docx para esto.]'
    return ''
