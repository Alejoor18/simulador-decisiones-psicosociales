import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ArchivoFuente, ExtrasService } from '../core/services/extras.service';

@Component({
  selector: 'app-importacion-documentos',
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatProgressBarModule, MatSnackBarModule,
  ],
  template: `
    <section class="page">
      <header>
        <h1>Importar caso desde documento</h1>
        <p class="subtitle">Sube un PDF o TXT con el contenido del caso. Lo procesamos y creamos un caso "En revisión" para que lo edites.</p>
      </header>

      <mat-card class="step">
        <h2><span class="num">1</span> Subir archivo</h2>
        <p class="hint">Formatos: PDF, TXT (DOCX limitado).</p>
        <input #fileInput type="file" accept=".pdf,.txt,.docx" hidden (change)="seleccionar($event)" />
        <button mat-flat-button color="primary" (click)="fileInput.click()" [disabled]="loading()">
          <mat-icon>upload_file</mat-icon> Seleccionar archivo
        </button>
        @if (archivo(); as a) {
          <div class="info">
            <mat-icon>description</mat-icon>
            <strong>{{ a.nombre_original }}</strong> ({{ a.tipo }}) — {{ a.estado_display }}
          </div>
        }
      </mat-card>

      @if (archivo()) {
        <mat-card class="step">
          <h2><span class="num">2</span> Procesar (extraer texto)</h2>
          <button mat-flat-button color="primary" (click)="procesar()"
            [disabled]="loading() || archivo()!.estado !== 'SUBIDO'">
            <mat-icon>auto_fix_high</mat-icon> Procesar
          </button>

          @if (archivo()!.texto_extraido) {
            <div class="texto-preview">
              <strong>Vista previa del texto extraído:</strong>
              <pre>{{ vistaPrevia() }}</pre>
            </div>
          }
        </mat-card>
      }

      @if (archivo()?.texto_extraido) {
        <mat-card class="step">
          <h2><span class="num">3</span> Crear caso</h2>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Nombre del caso</mat-label>
            <input matInput [(ngModel)]="nombreCaso" required maxlength="200" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Área psicosocial</mat-label>
            <input matInput [(ngModel)]="areaCaso" maxlength="150" />
          </mat-form-field>
          <button mat-flat-button color="primary"
            (click)="crearCaso()" [disabled]="loading() || !nombreCaso()">
            <mat-icon>create</mat-icon> Crear caso EN REVISIÓN
          </button>
        </mat-card>
      }

      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
    </section>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; max-width: 800px; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 500; }
    .subtitle { margin: 0.25rem 0 0; color: var(--mat-sys-on-surface-variant); font-size: 0.9rem; }
    .step { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }
    .step h2 { margin: 0; font-size: 1.1rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
    .num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--mat-sys-primary); color: var(--mat-sys-on-primary);
      font-size: 0.9rem; font-weight: 600;
    }
    .hint { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; margin: 0; }
    .info { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--mat-sys-surface-container); border-radius: 8px; }
    .texto-preview { width: 100%; }
    .texto-preview pre {
      white-space: pre-wrap; word-wrap: break-word;
      background: var(--mat-sys-surface-container);
      padding: 0.75rem; border-radius: 6px;
      max-height: 300px; overflow-y: auto;
      font-size: 0.85rem; margin: 0.5rem 0 0;
    }
    .full { width: 100%; }
    button { display: inline-flex; align-items: center; gap: 0.4rem; }
  `],
})
export class ImportacionDocumentos {
  private readonly servicio = inject(ExtrasService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly archivo = signal<ArchivoFuente | null>(null);
  readonly nombreCaso = signal('');
  readonly areaCaso = signal('');

  vistaPrevia(): string {
    const txt = this.archivo()?.texto_extraido ?? '';
    return txt.length > 1500 ? txt.slice(0, 1500) + '…' : txt;
  }

  seleccionar(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loading.set(true);
    this.servicio.subirArchivo(file).subscribe({
      next: (a) => {
        this.archivo.set(a);
        this.nombreCaso.set(a.nombre_original.replace(/\.[^.]+$/, ''));
        this.loading.set(false);
        this.snackBar.open('Archivo subido. Procesa para extraer el texto.', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(err?.error?.archivo?.[0] || 'No se pudo subir.', 'OK', { duration: 4000 });
      },
    });
  }

  procesar() {
    const a = this.archivo();
    if (!a) return;
    this.loading.set(true);
    this.servicio.procesarArchivo(a.id).subscribe({
      next: (res) => { this.archivo.set(res); this.loading.set(false); this.snackBar.open('Texto extraído.', 'OK', { duration: 2500 }); },
      error: () => { this.loading.set(false); this.snackBar.open('No se pudo procesar.', 'OK', { duration: 3500 }); },
    });
  }

  crearCaso() {
    const a = this.archivo();
    if (!a) return;
    this.loading.set(true);
    this.servicio.crearCasoDesdeArchivo(a.id, this.nombreCaso(), this.areaCaso()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.snackBar.open('Caso creado. Te llevamos al editor.', 'OK', { duration: 2500 });
        this.router.navigate(['/casos', res.caso_id]);
      },
      error: () => { this.loading.set(false); this.snackBar.open('No se pudo crear el caso.', 'OK', { duration: 3500 }); },
    });
  }
}
