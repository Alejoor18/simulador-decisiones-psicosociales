import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Observable, map, shareReplay } from 'rxjs';

import { environment } from '../../../../environments/environment';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatDividerModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly breakpointObserver = inject(BreakpointObserver);

  @ViewChild(MatSidenav) sidenav?: MatSidenav;

  readonly appName = environment.appName;

  readonly isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map((result) => result.matches),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  readonly navItems: NavItem[] = [
    { label: 'Panel docente', route: '/docente', icon: 'school' },
    { label: 'Panel administrador', route: '/admin', icon: 'admin_panel_settings' },
    { label: 'Casos de estudio', route: '/casos', icon: 'menu_book' },
    { label: 'IA generativa', route: '/ia-generativa', icon: 'auto_awesome' },
    { label: 'Importar documentos', route: '/importacion-documentos', icon: 'upload_file' },
    { label: 'Prácticas', route: '/practicas', icon: 'event' },
    { label: 'Participaciones', route: '/participaciones', icon: 'play_circle' },
    { label: 'Resultados', route: '/resultados', icon: 'assessment' },
    { label: 'Reportes', route: '/reportes', icon: 'description' },
  ];

  /** Cierra el sidenav si está en modo 'over' (mobile/tablet) tras seleccionar una ruta. */
  closeIfOverMode(): void {
    if (this.sidenav?.mode === 'over') {
      this.sidenav.close();
    }
  }
}
