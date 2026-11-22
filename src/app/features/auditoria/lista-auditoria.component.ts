import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../../core/services/auditoria.service';
import { AuditoriaLog, AuditoriaResumen } from '../../core/models/auditoria.model';
import { PageResponse } from '../../core/services/usuario.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-lista-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './lista-auditoria.component.html',
  styleUrls: ['./lista-auditoria.component.css']
})
export class ListaAuditoriaComponent implements OnInit {
  readonly Math = Math;

  logs: AuditoriaLog[] = [];
  resumen: AuditoriaResumen | null = null;

  cargando = false;
  exportando = false;
  error: string | null = null;

  // Paginación
  page = 0;
  size = 15;
  totalElements = 0;
  totalPages = 0;

  // Filtros
  filtroModulo = '';
  filtroAccion = '';
  filtroBusqueda = '';

  // Modal Detalle
  mostrarModalDetalle = false;
  logSeleccionado: AuditoriaLog | null = null;

  modulosList = [
    { value: '', label: 'Todos los módulos' },
    { value: 'AUTH', label: 'Autenticación' },
    { value: 'PROYECTOS', label: 'Proyectos' },
    { value: 'REQUERIMIENTOS', label: 'Requerimientos' },
    { value: 'CASOS_PRUEBA', label: 'Casos de Prueba' },
    { value: 'EJECUCION', label: 'Ejecución' },
    { value: 'INCIDENCIAS', label: 'Incidencias' },
    { value: 'RETEST', label: 'Corrección y Retest' },
    { value: 'CONFIGURACION', label: 'Configuración' }
  ];

  accionesList = [
    { value: '', label: 'Todas las acciones' },
    { value: 'CREAR', label: 'Crear' },
    { value: 'ACTUALIZAR', label: 'Actualizar' },
    { value: 'ELIMINAR', label: 'Eliminar' },
    { value: 'EJECUTAR', label: 'Ejecutar' },
    { value: 'REABRIR', label: 'Reabrir' },
    { value: 'LOGIN', label: 'Iniciar Sesión' },
    { value: 'EXPORTAR', label: 'Exportar' }
  ];

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarLogs();
  }

  cargarResumen(): void {
    this.auditoriaService.obtenerResumen().subscribe({
      next: (res: AuditoriaResumen) => {
        this.resumen = res;
      },
      error: () => {}
    });
  }

  cargarLogs(): void {
    this.cargando = true;
    this.error = null;

    this.auditoriaService.buscar({
      modulo: this.filtroModulo || undefined,
      accion: this.filtroAccion || undefined,
      busqueda: this.filtroBusqueda.trim() || undefined,
      page: this.page,
      size: this.size
    }).subscribe({
      next: (res: PageResponse<AuditoriaLog>) => {
        this.cargando = false;
        this.logs = res?.content || [];
        this.totalElements = res?.totalElements || 0;
        this.totalPages = res?.totalPages || 0;
      },
      error: (err: any) => {
        this.cargando = false;
        this.error = 'Error al cargar los registros de auditoría: ' + (err?.error?.message || err.message);
      }
    });
  }

  aplicarFiltros(): void {
    this.page = 0;
    this.cargarLogs();
  }

  limpiarFiltros(): void {
    this.filtroModulo = '';
    this.filtroAccion = '';
    this.filtroBusqueda = '';
    this.page = 0;
    this.cargarLogs();
  }

  cambiarPagina(p: number): void {
    if (p >= 0 && p < this.totalPages) {
      this.page = p;
      this.cargarLogs();
    }
  }

  verDetalle(log: AuditoriaLog): void {
    this.logSeleccionado = log;
    this.mostrarModalDetalle = true;
  }

  cerrarModal(): void {
    this.mostrarModalDetalle = false;
    this.logSeleccionado = null;
  }

  exportarCsv(): void {
    this.exportando = true;
    this.auditoriaService.exportarCsv({
      modulo: this.filtroModulo || undefined,
      accion: this.filtroAccion || undefined,
      busqueda: this.filtroBusqueda.trim() || undefined
    }).subscribe({
      next: (blob: Blob) => {
        this.exportando = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_logs_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.exportando = false;
        alert('Error al exportar CSV: ' + (err?.error?.message || err.message));
      }
    });
  }

  getAccionClass(accion: string): string {
    switch (accion) {
      case 'CREAR': return 'badge-crear';
      case 'ACTUALIZAR': return 'badge-actualizar';
      case 'ELIMINAR': return 'badge-eliminar';
      case 'EJECUTAR': return 'badge-ejecutar';
      case 'REABRIR': return 'badge-reabrir';
      case 'LOGIN': return 'badge-login';
      default: return 'badge-default';
    }
  }

  getModuloClass(modulo: string): string {
    switch (modulo) {
      case 'AUTH': return 'mod-auth';
      case 'PROYECTOS': return 'mod-proyectos';
      case 'REQUERIMIENTOS': return 'mod-requerimientos';
      case 'CASOS_PRUEBA': return 'mod-casos';
      case 'EJECUCION': return 'mod-ejecucion';
      case 'INCIDENCIAS': return 'mod-incidencias';
      case 'RETEST': return 'mod-retest';
      case 'CONFIGURACION': return 'mod-config';
      default: return 'mod-default';
    }
  }
}
