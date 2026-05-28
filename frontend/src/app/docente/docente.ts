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
}

@Component({
  selector: 'app-docente',
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule],
  template: `
    <section class="page">
      <header class="welcome">
        <h1>Hola, {{ nombre() }} 👋</h1>
        <p>Panel docente del simulador de decisiones psicosociales.</p>
      </header>

      <div class="grid">
        @for (a of accesos(); track a.ruta) {
          <a [routerLink]="a.ruta" class="card-link">
            <mat-card class="card">
              <mat-card-header>
                <div mat-card-avatar class="avatar">
                  <mat-icon>{{ a.icono }}</mat-icon>
                </div>
                <mat-card-title>{{ a.titulo }}</mat-card-title>
                @if (a.badge) {
                  <mat-card-subtitle>{{ a.badge }}</mat-card-subtitle>
                }
              </mat-card-header>
              <mat-card-content>
                <p>{{ a.descripcion }}</p>
              </mat-card-content>
            </mat-card>
          </a>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .welcome { margin-bottom: 1.5rem; }
      .welcome h1 { margin: 0; font-size: 1.6rem; font-weight: 500; }
      .welcome p { margin: 0.25rem 0 0; color: var(--mat-sys-on-surface-variant); }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }

      .card-link { text-decoration: none; color: inherit; }

      .card {
        height: 100%;
        transition: box-shadow 0.2s, transform 0.2s;
        cursor: pointer;
        &:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
      }

      .avatar {
        background-color: var(--mat-sys-primary-container);
        display: flex; align-items: center; justify-content: center;
        mat-icon { color: var(--mat-sys-on-primary-container); }
      }

      mat-card-content p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class Docente implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly academico = inject(AcademicoService);

  readonly nombre = computed(
    () => this.auth.usuario()?.first_name || this.auth.usuario()?.username || '',
  );

  private readonly estudiantesCount = signal<number | null>(null);
  private readonly gruposCount = signal<number | null>(null);

  readonly accesos = computed<AccesoRapido[]>(() => [
    {
      titulo: 'Estudiantes',
      descripcion: 'Registra, vincula y organiza tus estudiantes.',
      icono: 'group',
      ruta: '/estudiantes',
      badge: this.formatBadge(this.estudiantesCount(), 'estudiantes'),
    },
    {
      titulo: 'Grupos',
      descripcion: 'Agrupa estudiantes para asignar prácticas en lote.',
      icono: 'workspaces',
      ruta: '/grupos',
      badge: this.formatBadge(this.gruposCount(), 'grupos'),
    },
    {
      titulo: 'Casos de estudio',
      descripcion: 'Crea casos manualmente o con asistencia de IA.',
      icono: 'menu_book',
      ruta: '/casos',
    },
    {
      titulo: 'Prácticas académicas',
      descripcion: 'Agenda prácticas y genera códigos para tus estudiantes.',
      icono: 'event',
      ruta: '/practicas',
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

  private formatBadge(n: number | null, etiqueta: string): string | undefined {
    if (n === null) return undefined;
    return `${n} ${etiqueta}`;
  }
}
