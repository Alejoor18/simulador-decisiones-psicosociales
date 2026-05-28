import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';
import { AcademicoService } from '../core/services/academico.service';

interface AccesoRapido {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  badge?: string;
  color?: 'primary' | 'tertiary' | 'secondary';
}

@Component({
  selector: 'app-docente',
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule],
  template: `
    <section class="page">

      <!-- Hero -->
      <header class="hero bg-gradient anim-fade-up">
        <div class="hero-text">
          <span class="badge">{{ saludo() }}</span>
          <h1 class="display">Hola, {{ nombre() }} 👋</h1>
          <p>
            Diseña casos, agenda prácticas y acompaña a tus estudiantes en
            decisiones psicosociales con sentido.
          </p>
        </div>
        <div class="hero-icon">
          <mat-icon>psychology</mat-icon>
        </div>
      </header>

      <!-- Stats rápidas -->
      <div class="stats">
        <div class="stat">
          <mat-icon>group</mat-icon>
          <div>
            <strong>{{ estudiantesCount() ?? '—' }}</strong>
            <span>Estudiantes</span>
          </div>
        </div>
        <div class="stat">
          <mat-icon>workspaces</mat-icon>
          <div>
            <strong>{{ gruposCount() ?? '—' }}</strong>
            <span>Grupos</span>
          </div>
        </div>
      </div>

      <!-- Accesos rápidos -->
      <h2 class="seccion-titulo">Empieza por aquí</h2>

      <div class="grid">
        @for (a of accesos(); track a.ruta; let i = $index) {
          <a [routerLink]="a.ruta" class="card-link"
            [style.--delay]="i * 0.05 + 's'">
            <article class="acceso-card elevated-card" [attr.data-color]="a.color || 'primary'">
              <div class="acceso-icon">
                <mat-icon>{{ a.icono }}</mat-icon>
              </div>
              <div class="acceso-body">
                <h3>{{ a.titulo }}</h3>
                <p>{{ a.descripcion }}</p>
              </div>
              <mat-icon class="arrow">arrow_forward</mat-icon>
            </article>
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }

    .hero {
      display: flex; gap: 2rem; align-items: center; justify-content: space-between;
      padding: 2rem 2.25rem;
      border-radius: 24px;
      background-color: var(--mat-sys-surface);
      position: relative; overflow: hidden;

      .hero-text { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
      .badge {
        align-self: flex-start;
        padding: 0.25rem 0.75rem;
        background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);
        color: var(--mat-sys-primary);
        border-radius: 999px;
        font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      }
      .display {
        margin: 0;
        font-size: 2rem; font-weight: 700;
        background: linear-gradient(135deg, var(--mat-sys-primary), var(--mat-sys-tertiary));
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      p { margin: 0; color: var(--mat-sys-on-surface-variant); font-size: 1.02rem; max-width: 60ch; }

      .hero-icon {
        width: 96px; height: 96px;
        border-radius: 24px;
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 10px 30px color-mix(in srgb, var(--mat-sys-primary) 35%, transparent);
        mat-icon { font-size: 48px; width: 48px; height: 48px; }
      }
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    .stat {
      padding: 1rem 1.25rem;
      background: var(--mat-sys-surface);
      border-radius: 16px;
      display: flex; align-items: center; gap: 0.75rem;
      border: 1px solid var(--mat-sys-outline-variant);

      mat-icon { color: var(--mat-sys-primary); font-size: 28px; width: 28px; height: 28px; }
      strong {
        display: block;
        font-size: 1.6rem; font-weight: 700; line-height: 1;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      span { font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); }
    }

    .seccion-titulo {
      margin: 0.25rem 0 -0.5rem;
      font-size: 1.2rem; font-weight: 600;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .card-link {
      text-decoration: none; color: inherit;
      animation: fade-up 0.4s ease both;
      animation-delay: var(--delay, 0s);
    }

    .acceso-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.25rem;
      transition: transform 0.15s, box-shadow 0.15s;
      cursor: pointer;
      position: relative; overflow: hidden;

      &::before {
        content: ''; position: absolute;
        top: -40%; right: -20%;
        width: 60%; height: 180%;
        background: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent);
        transform: rotate(15deg);
        opacity: 0; transition: opacity 0.2s;
      }

      &:hover {
        transform: translateY(-3px);
        box-shadow:
          0 1px 2px rgba(0,0,0,0.04),
          0 18px 36px rgba(0,0,0,0.10);
        &::before { opacity: 1; }
      }

      .acceso-icon {
        width: 52px; height: 52px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);
        color: var(--mat-sys-primary);
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0; position: relative; z-index: 1;
        mat-icon { font-size: 26px; width: 26px; height: 26px; }
      }
      .acceso-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
      h3 { margin: 0; font-size: 1.05rem; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; }
      p { margin: 0.15rem 0 0; font-size: 0.88rem; color: var(--mat-sys-on-surface-variant); line-height: 1.4; }

      .arrow {
        color: var(--mat-sys-on-surface-variant);
        transition: transform 0.15s, color 0.15s;
        position: relative; z-index: 1;
      }
      &:hover .arrow { transform: translateX(4px); color: var(--mat-sys-primary); }
    }

    .acceso-card[data-color="tertiary"] {
      .acceso-icon {
        background: color-mix(in srgb, var(--mat-sys-tertiary) 14%, transparent);
        color: var(--mat-sys-tertiary);
      }
    }

    @media (max-width: 600px) {
      .hero { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 1.5rem; }
      .hero .hero-icon { width: 72px; height: 72px; mat-icon { font-size: 36px; width: 36px; height: 36px; } }
      .display { font-size: 1.5rem !important; }
    }
  `],
})
export class Docente implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly academico = inject(AcademicoService);

  readonly nombre = computed(
    () => this.auth.usuario()?.first_name || this.auth.usuario()?.username || 'docente',
  );

  readonly estudiantesCount = signal<number | null>(null);
  readonly gruposCount = signal<number | null>(null);

  readonly saludo = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  readonly accesos = computed<AccesoRapido[]>(() => [
    {
      titulo: 'Estudiantes',
      descripcion: 'Registra, vincula y organiza tus estudiantes.',
      icono: 'group',
      ruta: '/estudiantes',
    },
    {
      titulo: 'Grupos',
      descripcion: 'Agrupa estudiantes para asignar prácticas en lote.',
      icono: 'workspaces',
      ruta: '/grupos',
    },
    {
      titulo: 'Casos de estudio',
      descripcion: 'Crea casos narrativos manualmente o asistido por IA.',
      icono: 'menu_book',
      ruta: '/casos',
    },
    {
      titulo: 'IA generativa',
      descripcion: 'Genera un caso completo a partir de un tema.',
      icono: 'auto_awesome',
      ruta: '/ia-generativa',
      color: 'tertiary',
    },
    {
      titulo: 'Importar documento',
      descripcion: 'Sube un PDF y conviértelo en un caso para revisar.',
      icono: 'upload_file',
      ruta: '/importacion-documentos',
      color: 'tertiary',
    },
    {
      titulo: 'Prácticas académicas',
      descripcion: 'Agenda prácticas y entrega códigos a tus estudiantes.',
      icono: 'event',
      ruta: '/practicas',
    },
    {
      titulo: 'Resultados',
      descripcion: 'Revisa notas, retroalimenta y descarga reportes.',
      icono: 'assessment',
      ruta: '/resultados',
    },
  ]);

  ngOnInit(): void {
    forkJoin({
      estudiantes: this.academico.listarEstudiantes(),
      grupos: this.academico.listarGrupos(),
    }).subscribe(({ estudiantes, grupos }) => {
      this.estudiantesCount.set(estudiantes.count);
      this.gruposCount.set(grupos.count);
    });
  }
}
