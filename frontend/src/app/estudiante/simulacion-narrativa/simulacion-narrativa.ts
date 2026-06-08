import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EstudianteSessionService } from '../../core/services/estudiante-session.service';
import { FullscreenService } from '../../core/services/fullscreen.service';
import { AmbienteAudioService } from '../../core/simulacion-narrativa/services/ambiente-audio.service';
import { NarrativaFacadeService } from '../../core/simulacion-narrativa/services/narrativa-facade.service';
import {
  marcarIntroduccionVista,
  resolverFaseIntro,
} from '../../core/simulacion-narrativa/utils/introduccion-narrativa.util';
import {
  resolverCasoNarrativoId,
  subtituloCasoParaPractica,
} from '../../core/utils/caso-narrativo.util';
import { BarraSimulacionComponent } from '../components/barra-simulacion/barra-simulacion';
import { ControlAmbienteAudioComponent } from '../components/control-ambiente-audio/control-ambiente-audio';
import {
  MapaEscenasDialogComponent,
  MapaEscenasDialogData,
} from '../components/mapa-escenas-dialog/mapa-escenas-dialog';
import { SalirPracticaDialogComponent } from '../components/salir-practica-dialog/salir-practica-dialog';
import { ExploracionVisualComponent } from '../exploracion-visual/exploracion-visual';
import { IntroduccionNarrativaComponent } from '../exploracion-visual/introduccion-narrativa/introduccion-narrativa';
import { EscenaVisualService } from '../exploracion-visual/services/escena-visual.service';
import { LibretaPsicologoComponent } from '../libreta-psicologo/libreta-psicologo';

type FaseSimulacion = 'cargando' | 'intro' | 'simulacion';

@Component({
  selector: 'app-simulacion-narrativa',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    BarraSimulacionComponent,
    ControlAmbienteAudioComponent,
    ExploracionVisualComponent,
    IntroduccionNarrativaComponent,
    LibretaPsicologoComponent,
  ],
  templateUrl: './simulacion-narrativa.html',
  styleUrl: './simulacion-narrativa.scss',
})
export class SimulacionNarrativa implements OnInit, OnDestroy {
  private readonly facade = inject(NarrativaFacadeService);
  private readonly escenas = inject(EscenaVisualService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(EstudianteSessionService);
  private readonly fullscreen = inject(FullscreenService);
  private readonly dialog = inject(MatDialog);
  private readonly ambiente = inject(AmbienteAudioService);

  @ViewChild('viewport') viewportRef?: ElementRef<HTMLElement>;
  @ViewChild(LibretaPsicologoComponent) libreta?: LibretaPsicologoComponent;

  readonly cargando = this.facade.cargando;
  readonly error = this.facade.error;
  readonly fase = signal<FaseSimulacion>('cargando');
  readonly practicaId = signal<number | null>(null);
  readonly casoId = signal('violencia-intrafamiliar');
  readonly pantallaCompletaActiva = this.fullscreen.activo;

  readonly practica = computed(() => {
    const id = this.practicaId();
    return id ? this.session.obtenerPractica(id) : null;
  });

  readonly nombrePractica = computed(() => this.practica()?.nombre ?? 'Práctica');
  readonly nombreCaso = computed(() => {
    const p = this.practica();
    if (!p) return this.facade.caso()?.manifest.titulo ?? 'Caso clínico';
    return subtituloCasoParaPractica(p, this.casoId());
  });

  readonly estadoLabel = computed(() => {
    const estado = this.practica()?.progreso.estado;
    if (estado === 'completada') return 'Completada';
    if (estado === 'no_iniciada') return 'Sin iniciar';
    return 'En progreso';
  });

  ngOnInit(): void {
    const practicaParam = this.route.snapshot.paramMap.get('practicaId');
    const casoParam =
      this.route.snapshot.paramMap.get('casoId') ??
      this.route.snapshot.queryParamMap.get('caso');

    if (practicaParam) {
      const practicaId = Number(practicaParam);
      const registro = this.session.obtenerPractica(practicaId);
      if (!registro) {
        this.router.navigate(['/estudiante/panel']);
        return;
      }
      this.practicaId.set(practicaId);
      this.session.seleccionarPractica(practicaId);
      const casoNarrativo = resolverCasoNarrativoId(registro);
      this.casoId.set(casoNarrativo);
    } else if (casoParam) {
      this.casoId.set(casoParam);
    } else {
      const activa = this.session.practicaActiva();
      if (activa) {
        this.practicaId.set(activa.id);
        this.casoId.set(resolverCasoNarrativoId(activa));
      }
    }

    const casoId = this.casoId();
    const estudianteId = this.session.estudianteId();
    this.facade.iniciarCaso(casoId).subscribe({
      next: () => {
        if (this.practicaId()) {
          this.session.marcarEnProgreso(this.practicaId()!);
        }
        const faseInicial = resolverFaseIntro(casoId, estudianteId);
        this.fase.set(faseInicial);
        void this.ambiente.iniciar(faseInicial === 'intro' ? 'intro' : 'simulacion');
      },
      error: () => undefined,
    });
  }

  ngOnDestroy(): void {
    this.ambiente.detener();
    void this.fullscreen.salir();
  }

  onInteraccionViewport(): void {
    void this.ambiente.desbloquearTrasInteraccion();
  }

  onIntroduccionCompleta(): void {
    marcarIntroduccionVista(this.casoId(), this.session.estudianteId());
    this.fase.set('simulacion');
    void this.ambiente.transicionIntroAHospital();
  }

  onSinIntroduccion(): void {
    this.fase.set('simulacion');
    void this.ambiente.transicionIntroAHospital();
  }

  abrirLibreta(): void {
    this.libreta?.togglePanel();
  }

  abrirMapa(): void {
    const actualId = this.escenas.escenaActualId();
    const estado = this.facade.estado();
    const caso = this.facade.caso();
    const escenasVisibles = this.escenas.escenasAccesibles(estado, caso);
    const data: MapaEscenasDialogData = {
      escenas: escenasVisibles.map((e) => ({
        id: e.id,
        titulo: e.titulo,
        actual: e.id === actualId,
      })),
    };
    this.dialog.open(MapaEscenasDialogComponent, {
      data,
      width: '420px',
      panelClass: 'dialogo-mapa-escenas',
    });
  }

  alternarPantallaCompleta(): void {
    const el = this.viewportRef?.nativeElement;
    if (!el) return;
    void this.fullscreen.alternar(el);
  }

  confirmarSalida(): void {
    const ref = this.dialog.open(SalirPracticaDialogComponent, {
      width: '440px',
      disableClose: true,
    });

    ref.afterClosed().subscribe((salir) => {
      if (!salir) return;
      this.persistirProgreso();
      void this.fullscreen.salir();
      this.router.navigate(['/estudiante/panel']);
    });
  }

  private persistirProgreso(): void {
    const practicaId = this.practicaId();
    if (!practicaId) return;

    const estado = this.facade.estado();
    const caso = this.facade.caso();
    const completadas = estado?.conversacionesCompletadas.length ?? 0;
    const totales = caso ? Object.keys(caso.conversaciones).length : 0;

    this.session.guardarProgreso(practicaId, {
      conversacionesCompletadas: completadas,
      conversacionesTotales: totales,
    });
  }
}
