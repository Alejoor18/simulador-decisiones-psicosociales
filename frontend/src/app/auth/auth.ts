import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

import { environment } from '../../environments/environment';

/**
 * Layout para autenticación (login, registro docente).
 * Split-screen: panel izquierdo con marca/concepto, panel derecho con el formulario.
 * Colapsa a una sola columna en mobile.
 */
@Component({
  selector: 'app-auth',
  imports: [CommonModule, RouterOutlet, MatIconModule],
  template: `
    <div class="split">
      <aside class="brand-panel bg-gradient">
        <div class="brand-inner">
          <span class="logo">
            <mat-icon class="logo-icon">psychology</mat-icon>
          </span>
          <h1 class="display">{{ appName }}</h1>
          <p class="tagline">
            Vive casos de psicología social como decisiones reales.
            Aprende del conflicto, del grupo y de tus propias respuestas.
          </p>

          <ul class="bullets">
            <li>
              <mat-icon>menu_book</mat-icon>
              <span>Casos narrativos con escenarios y decisiones</span>
            </li>
            <li>
              <mat-icon>group</mat-icon>
              <span>Diseñado para docentes y estudiantes universitarios</span>
            </li>
            <li>
              <mat-icon>auto_awesome</mat-icon>
              <span>Apoyo de IA para crear contenido pedagógico</span>
            </li>
          </ul>

          <footer class="brand-foot">Universidad EAN · 2026</footer>
        </div>
      </aside>

      <main class="form-panel">
        <div class="form-wrap anim-fade-up">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }

      .split {
        display: grid;
        grid-template-columns: 5fr 4fr;
        min-height: 100vh;
      }

      .brand-panel {
        position: relative;
        color: var(--mat-sys-on-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 2.5rem;
        overflow: hidden;
      }
      .brand-panel::before {
        content: '';
        position: absolute; inset: 0;
        background:
          radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--mat-sys-primary) 35%, transparent), transparent 50%),
          radial-gradient(circle at 80% 90%, color-mix(in srgb, var(--mat-sys-tertiary) 28%, transparent), transparent 50%);
        z-index: 0;
      }

      .brand-inner {
        position: relative;
        z-index: 1;
        max-width: 460px;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .logo {
        width: 64px; height: 64px;
        border-radius: 18px;
        background: var(--mat-sys-primary);
        color: var(--mat-sys-on-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px color-mix(in srgb, var(--mat-sys-primary) 40%, transparent);
      }
      .logo-icon { font-size: 36px; width: 36px; height: 36px; }

      .display {
        margin: 0;
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--mat-sys-primary), var(--mat-sys-tertiary));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .tagline {
        margin: 0;
        font-size: 1.05rem;
        line-height: 1.55;
        color: var(--mat-sys-on-surface);
        opacity: 0.85;
      }

      .bullets {
        list-style: none;
        padding: 0;
        margin: 1rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--mat-sys-on-surface);

          mat-icon {
            color: var(--mat-sys-primary);
            background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent);
            padding: 0.5rem;
            border-radius: 10px;
            width: 36px; height: 36px;
            font-size: 20px;
            display: flex; align-items: center; justify-content: center;
          }
        }
      }

      .brand-foot {
        margin-top: 1.5rem;
        font-size: 0.85rem;
        opacity: 0.6;
      }

      .form-panel {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.5rem;
        background-color: var(--mat-sys-surface);
      }

      .form-wrap {
        width: 100%;
        max-width: 440px;
      }

      // Mobile: una sola columna, brand reducido arriba
      @media (max-width: 900px) {
        .split { grid-template-columns: 1fr; }
        .brand-panel { padding: 2rem 1.5rem 1.5rem; min-height: auto; }
        .brand-inner { gap: 0.75rem; align-items: center; text-align: center; }
        .display { font-size: 1.6rem; }
        .tagline { font-size: 0.95rem; }
        .bullets { display: none; }
        .brand-foot { display: none; }
      }
    `,
  ],
})
export class Auth {
  readonly appName = environment.appName;
}
