import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../core/services/reportes.service';
import { ProyectoService } from '../../core/services/proyecto.service';
import { DashboardReportes, TendenciaDiaria } from '../../core/models/reportes.model';
import { ProyectoResponse } from '../../core/models/proyecto.model';
import { SelectSearchComponent, SelectOption } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectSearchComponent],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  readonly Math = Math;

  proyectos: ProyectoResponse[] = [];
  filtroProyecto: number | null = null;
  filtroRango: string = 'SPRINT_ACTUAL';
  filtroAmbiente: string = 'TODOS';

  dashboard: DashboardReportes | null = null;
  cargando = false;
  exportando = false;
  error: string | null = null;

  constructor(
    private reportesService: ReportesService,
    private proyectoService: ProyectoService
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => {
        const lista = res?.content ?? res ?? [];
        this.proyectos = lista;
        if (this.proyectos.length > 0 && !this.filtroProyecto) {
          this.seleccionarProyecto(this.proyectos[0].id.toString());
        }
      },
      error: (err: any) => {
        this.error = 'Error al cargar la lista de proyectos: ' + (err?.error?.message || err.message);
      }
    });
  }

  seleccionarProyecto(idStr: string | null): void {
    this.filtroProyecto = idStr ? +idStr : null;
    if (this.filtroProyecto) {
      this.cargarDashboard();
    } else {
      this.dashboard = null;
    }
  }

  cargarDashboard(): void {
    if (!this.filtroProyecto) return;

    this.cargando = true;
    this.error = null;

    this.reportesService.obtenerDashboard(this.filtroProyecto).subscribe({
      next: (res: DashboardReportes) => {
        this.cargando = false;
        this.dashboard = res;
      },
      error: (err: any) => {
        this.cargando = false;
        this.error = 'Error al obtener métricas del proyecto: ' + (err?.error?.message || err.message);
      }
    });
  }

  refrescar(): void {
    this.cargarDashboard();
  }

  exportarCsv(): void {
    if (!this.filtroProyecto) return;

    this.exportando = true;
    this.reportesService.exportarCsv(this.filtroProyecto).subscribe({
      next: (blob: Blob) => {
        this.exportando = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_calidad_${this.filtroProyecto}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.exportando = false;
        this.error = 'Error al exportar reporte: ' + (err?.error?.message || err.message);
      }
    });
  }

  descargarReportePdf(): void {
    window.print();
  }

  // --- SVG Chart Helpers ---
  getMaxCasosDia(): number {
    if (!this.dashboard || !this.dashboard.tendencia) return 10;
    const max = Math.max(...this.dashboard.tendencia.map((t: TendenciaDiaria) => t.total), 10);
    return Math.ceil(max / 5) * 5;
  }

  calcularBarHeight(count: number, max: number): number {
    if (!count || max === 0) return 0;
    return Math.min(130, Math.round((count / max) * 125));
  }

  calcularBarY(height: number): number {
    return 160 - height;
  }

  getCurvaTendencia(): string {
    if (!this.dashboard || !this.dashboard.tendencia || this.dashboard.tendencia.length === 0) {
      return '';
    }
    const pts = this.dashboard.tendencia;
    const width = 640;
    const step = width / Math.max(1, pts.length - 1);

    let d = '';
    pts.forEach((pt: TendenciaDiaria, i: number) => {
      const x = 30 + (i * step);
      // y escala: 100% estabilidad -> y=30, 0% -> y=160
      const pct = Math.max(0, Math.min(100, pt.estabilidadPct));
      const y = Math.round(160 - (pct / 100.0) * 130);

      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        const prevX = 30 + ((i - 1) * step);
        const midX = (prevX + x) / 2;
        d += ` Q ${prevX + 15} ${y}, ${x} ${y}`;
      }
    });
    return d;
  }

  getUltimoPuntoCurva(): { cx: number; cy: number } {
    if (!this.dashboard || !this.dashboard.tendencia || this.dashboard.tendencia.length === 0) {
      return { cx: 670, cy: 30 };
    }
    const pts = this.dashboard.tendencia;
    const last = pts[pts.length - 1];
    const pct = Math.max(0, Math.min(100, last.estabilidadPct));
    return {
      cx: 670,
      cy: Math.round(160 - (pct / 100.0) * 130)
    };
  }

  // --- Opciones para SelectSearch ---
  opcionesProyectos(): SelectOption[] {
    return this.proyectos.map(p => ({
      value: p.id.toString(),
      label: `${p.codigo} - ${p.nombre}`
    }));
  }

  toValue(val: number | null): string {
    return val != null ? val.toString() : '';
  }
}
