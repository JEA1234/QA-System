import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrazabilidadService } from '../../core/services/trazabilidad.service';
import { ProyectoService } from '../../core/services/proyecto.service';
import { RequerimientoService } from '../../core/services/requerimiento.service';
import { MatrizResumen, FilaMatriz, CasoTrazabilidad } from '../../core/models/trazabilidad.model';
import { ProyectoResponse } from '../../core/models/proyecto.model';
import { ModuloResponse } from '../../core/models/requerimiento.model';
import { SelectSearchComponent, SelectOption } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-matriz-trazabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectSearchComponent],
  templateUrl: './matriz-trazabilidad.component.html',
  styleUrls: ['./matriz-trazabilidad.component.css']
})
export class MatrizTrazabilidadComponent implements OnInit {
  proyectos: ProyectoResponse[] = [];
  modulos: ModuloResponse[] = [];

  filtroProyecto: number | null = null;
  filtroModulo: number | null = null;
  filtroCobertura: string = '';
  filtroBusqueda: string = '';

  resumen: MatrizResumen | null = null;
  filasFiltradas: FilaMatriz[] = [];

  cargando = false;
  exportando = false;
  error: string | null = null;
  expandirTodo = false;
  filaDetalle: FilaMatriz | null = null;

  constructor(
    private trazabilidadService: TrazabilidadService,
    private proyectoService: ProyectoService,
    private requerimientoService: RequerimientoService
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
        this.error = 'Error al cargar los proyectos: ' + (err?.error?.message || err.message);
      }
    });
  }

  seleccionarProyecto(idStr: string | null): void {
    this.filtroProyecto = idStr ? +idStr : null;
    this.filtroModulo = null;
    this.modulos = [];

    if (this.filtroProyecto) {
      this.cargarModulos(this.filtroProyecto);
      this.cargarMatriz();
    } else {
      this.resumen = null;
      this.filasFiltradas = [];
    }
  }

  cargarModulos(proyectoId: number): void {
    this.requerimientoService.listarModulos(proyectoId).subscribe({
      next: (res: ModuloResponse[]) => {
        this.modulos = res || [];
      },
      error: () => {
        this.modulos = [];
      }
    });
  }

  seleccionarModulo(idStr: string | null): void {
    this.filtroModulo = idStr ? +idStr : null;
    this.cargarMatriz();
  }

  cambiarCobertura(estado: string): void {
    this.filtroCobertura = estado;
    this.cargarMatriz();
  }

  cargarMatriz(): void {
    if (!this.filtroProyecto) return;

    this.cargando = true;
    this.error = null;

    this.trazabilidadService.obtenerMatriz(
      this.filtroProyecto,
      this.filtroModulo,
      this.filtroCobertura || null
    ).subscribe({
      next: (res: MatrizResumen) => {
        this.cargando = false;
        this.resumen = res;
        this.resumen.filas.forEach((f: FilaMatriz) => (f.expandido = this.expandirTodo));
        this.aplicarFiltroLocal();
      },
      error: (err: any) => {
        this.cargando = false;
        this.error = 'Error al cargar la matriz de trazabilidad: ' + (err?.error?.message || err.message);
      }
    });
  }

  aplicarFiltroLocal(): void {
    if (!this.resumen) {
      this.filasFiltradas = [];
      return;
    }

    if (!this.filtroBusqueda.trim()) {
      this.filasFiltradas = [...this.resumen.filas];
      return;
    }

    const term = this.filtroBusqueda.toLowerCase();
    this.filasFiltradas = this.resumen.filas.filter(f =>
      f.requerimientoCodigo.toLowerCase().includes(term) ||
      f.requerimientoDescripcion.toLowerCase().includes(term) ||
      (f.moduloNombre && f.moduloNombre.toLowerCase().includes(term))
    );
  }

  abrirDetalle(fila: FilaMatriz): void {
    this.filaDetalle = fila;
  }

  cerrarDetalle(): void {
    this.filaDetalle = null;
  }

  toggleFila(fila: FilaMatriz): void {
    fila.expandido = !fila.expandido;
  }

  toggleExpandirTodo(): void {
    this.expandirTodo = !this.expandirTodo;
    if (this.resumen) {
      this.resumen.filas.forEach((f: FilaMatriz) => (f.expandido = this.expandirTodo));
    }
  }

  exportarCsv(): void {
    if (!this.filtroProyecto) return;

    this.exportando = true;
    this.trazabilidadService.exportarCsv(this.filtroProyecto).subscribe({
      next: (blob: Blob) => {
        this.exportando = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `matriz_trazabilidad_${this.filtroProyecto}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.exportando = false;
        this.error = 'Error al exportar CSV: ' + (err?.error?.message || err.message);
      }
    });
  }

  // --- Opciones para app-select-search ---
  opcionesProyectos(): SelectOption[] {
    return this.proyectos.map(p => ({
      value: p.id.toString(),
      label: `${p.codigo} - ${p.nombre}`
    }));
  }

  opcionesModulos(): SelectOption[] {
    return this.modulos.map(m => ({
      value: m.id.toString(),
      label: m.nombre
    }));
  }

  toValue(val: number | null): string {
    return val != null ? val.toString() : '';
  }

  getCssCobertura(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'badge-aprobado';
      case 'FALLIDO': return 'badge-fallido';
      case 'PENDIENTE': return 'badge-pendiente';
      case 'SIN_COBERTURA': return 'badge-sin-cobertura';
      default: return 'badge-default';
    }
  }

  getCssFila(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'row-ok';
      case 'FALLIDO': return 'row-fail';
      case 'PENDIENTE': return 'row-pend';
      case 'SIN_COBERTURA': return 'row-none';
      default: return '';
    }
  }

  getTextoCobertura(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'Aprobado';
      case 'FALLIDO': return 'Fallido';
      case 'PENDIENTE': return 'Pendiente';
      case 'SIN_COBERTURA': return 'Sin cobertura';
      default: return estado;
    }
  }

  getBadgeResultado(resultado: string): string {
    switch (resultado) {
      case 'APROBADO': return 'res-aprobado';
      case 'FALLIDO': return 'res-fallido';
      case 'BLOQUEADO': return 'res-bloqueado';
      case 'PENDIENTE': return 'res-pendiente';
      case 'EN_EJECUCION': return 'res-ejecucion';
      default: return 'res-default';
    }
  }
}

