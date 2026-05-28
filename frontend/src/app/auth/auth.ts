import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { environment } from '../../environments/environment';

/**
 * Layout para las pantallas de autenticación (login, registro docente).
 * Sin sidenav: tarjeta centrada con marca + slot para el formulario hijo.
 */
@Component({
  selector: 'app-auth',
  imports: [RouterOutlet],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <header class="brand">
          <h2 class="brand-name">{{ appName }}</h2>
          <p class="brand-tagline">Toma de decisiones psicosociales</p>
        </header>
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background-color: var(--mat-sys-surface-container-low);
      }

      .auth-card {
        width: 100%;
        max-width: 460px;
        padding: 2rem 1.75rem;
        background-color: var(--mat-sys-surface);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .brand {
        text-align: center;
        margin-bottom: 0.5rem;
      }

      .brand-name {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--mat-sys-primary);
      }

      .brand-tagline {
        margin: 0.25rem 0 0;
        font-size: 0.8rem;
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class Auth {
  readonly appName = environment.appName;
}
