import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EstadoPracticaEstudiante } from '../../core/models/estudiante-session.model';
import { EstudianteSessionService } from '../../core/services/estudiante-session.service';
import {
  obtenerCatalogoCaso,
  resolverCasoNarrativoId,
  subtituloCasoParaPractica,
} from '../../core/utils/caso-narrativo.util';
import { EstudianteShellComponent } from '../estudiante-shell/estudiante-shell';

@Component({
  selector: 'app-practica-info',
  imports: [DatePipe, NgClass, RouterLink, EstudianteShellComponent],
  templateUrl: './practica-info.html',
  styleUrl: './practica-info.scss',
})
export class PracticaInfoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(EstudianteSessionService);

  readonly practica = signal(this.session.obtenerPractica(0));

  readonly casoNarrativoId = computed(() => {
    const p = this.practica();
    return p ? resolverCasoNarrativoId(p) : '';
  });

  readonly subtituloCaso = computed(() => {
    const p = this.practica();
    if (!p) return '';
    return subtituloCasoParaPractica(p, this.casoNarrativoId());
  });

  readonly catalogo = computed(() => obtenerCatalogoCaso(this.casoNarrativoId()));

  readonly puedeIniciar = computed(() => this.catalogo()?.disponible ?? true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('practicaId'));
    const practica = this.session.obtenerPractica(id);
    if (!practica) {
      this.router.navigate(['/estudiante/panel']);
      return;
    }
    this.session.seleccionarPractica(id);
    this.practica.set(practica);
  }

  etiquetaEstado(estado: string): string {
    switch (estado) {
      case 'completada':
        return 'Completada';
      case 'en_progreso':
        return 'En progreso';
      default:
        return 'Sin iniciar';
    }
  }

  badgeClase(estado: EstadoPracticaEstudiante): string {
    switch (estado) {
      case 'completada':
        return 'badge--finalizado';
      case 'en_progreso':
        return 'badge--en-curso';
      default:
        return 'badge--sin-iniciar';
    }
  }

  iniciarSimulacion(): void {
    const p = this.practica();
    if (!p || !this.puedeIniciar()) return;
    this.router.navigate(['/estudiante/practicas', p.id, 'simulacion']);
  }
}
