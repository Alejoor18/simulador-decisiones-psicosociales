import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map, shareReplay } from 'rxjs';

import { EstudianteSessionService } from '../../core/services/estudiante-session.service';
import { NavIcon } from '../../shared/components/nav-icon/nav-icon';

@Component({
  selector: 'app-estudiante-shell',
  imports: [RouterLink, RouterLinkActive, MatSidenavModule, NavIcon],
  templateUrl: './estudiante-shell.html',
  styleUrl: './estudiante-shell.scss',
})
export class EstudianteShellComponent {
  readonly titulo = input('Estudiante');

  readonly estudianteSession = inject(EstudianteSessionService);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  readonly sidebarOpen = signal(true);
  readonly busqueda = signal('');

  readonly isHandset$ = this.breakpoint.observe(Breakpoints.Handset).pipe(
    map((r) => r.matches),
    shareReplay(1),
  );

  readonly isHandset = signal(false);

  readonly iniciales = computed(() => {
    const nombre = this.estudianteSession.nombreEstudiante();
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return 'E';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  });

  constructor() {
    this.isHandset$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((handset) => {
      this.isHandset.set(handset);
      this.sidebarOpen.set(!handset);
    });
  }

  sidebarMode(): 'over' | 'side' {
    return this.isHandset() ? 'over' : 'side';
  }

  onBusqueda(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busqueda.set(value);
    window.dispatchEvent(new CustomEvent('estudiante-busqueda', { detail: value }));
  }

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  closeIfOver(): void {
    if (this.isHandset()) this.closeSidebar();
  }

  cerrarSesion(): void {
    this.estudianteSession.cerrarSesion();
    window.location.href = '/estudiante';
  }
}
