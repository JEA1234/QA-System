import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorreccionRetestService } from '../../core/services/correccion-retest.service';
import { IncidenciaService } from '../../core/services/incidencia.service';
import { ProyectoService } from '../../core/services/proyecto.service';
import { ToastService } from '../../core/services/toast.service';
import {
  Correccion,
  CorreccionRequest,
  Retest,
  RetestRequest,
  Reapertura,
  ReaperturaRequest
} from '../../core/models/correccion-retest.model';
import { Incidencia } from '../../core/models/incidencia.model';
import { ProyectoResponse } from '../../core/models/proyecto.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SelectSearchComponent, SelectOption } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-correccion-retest',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, SelectSearchComponent],
  templateUrl: './correccion-retest.component.html',
  styleUrls: ['./correccion-retest.component.css']
})
export class CorreccionRetestComponent implements OnInit {
  incidencias: Incidencia[] = [];
  cargando = false;
  error: string | null = null;

  // Paginación
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  // Filtros
  filtroProyecto: number | null = null;
  filtroTab: 'RESUELTA' | 'EN_RESOLUCION' | 'CERRADA' | 'TODAS' = 'RESUELTA';
  filtroBusqueda = '';

  proyectos: ProyectoResponse[] = [];

  // Modales
  mostrarModalCorreccion = false;
  mostrarModalRetest = false;
  mostrarModalReapertura = false;
  mostrarModalHistorial = false;

  incidenciaSeleccionada: Incidencia | null = null;

  // Formulario Corrección (Dev)
  correccionForm: CorreccionRequest = {
    incidenciaId: 0,
    descripcion: '',
    commitHash: '',
    rama: '',
    versionCodigo: ''
  };
  guardandoCorreccion = false;

  // Formulario Retest (QA)
  retestForm: RetestRequest = {
    incidenciaId: 0,
    resultado: 'APROBADO',
    observaciones: ''
  };
  guardandoRetest = false;

  // Formulario Reapertura (Auditoría)
  reaperturaForm: ReaperturaRequest = {
    incidenciaId: 0,
    motivo: ''
  };
  guardandoReapertura = false;

  // Historiales para modal
  historialCorreccionesList: Correccion[] = [];
  historialRetestsList: Retest[] = [];
  historialReaperturasList: Reapertura[] = [];
  cargandoHistorial = false;

  constructor(
    private correccionRetestService: CorreccionRetestService,
    private incidenciaService: IncidenciaService,
    private proyectoService: ProyectoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarIncidencias();
  }

  cargarProyectos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => (this.proyectos = res.content || []),
      error: () => {}
    });
  }

  cargarIncidencias(): void {
    this.cargando = true;
    this.error = null;

    const estadoParam = this.filtroTab === 'TODAS' ? undefined : this.filtroTab;

    this.incidenciaService
      .listar({
        page: this.page,
        size: this.size,
        proyectoId: this.filtroProyecto || undefined,
        estado: estadoParam,
        busqueda: this.filtroBusqueda || undefined
      })
      .subscribe({
        next: (data: any) => {
          this.incidencias = data.content || [];
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
          this.cargando = false;
        },
        error: (err: any) => {
          this.error = 'No se pudieron cargar las incidencias.';
          this.cargando = false;
        }
      });
  }

  cambiarTab(tab: 'RESUELTA' | 'EN_RESOLUCION' | 'CERRADA' | 'TODAS'): void {
    this.filtroTab = tab;
    this.page = 0;
    this.cargarIncidencias();
  }

  aplicarFiltros(): void {
    this.page = 0;
    this.cargarIncidencias();
  }

  limpiarFiltros(): void {
    this.filtroProyecto = null;
    this.filtroBusqueda = '';
    this.filtroTab = 'RESUELTA';
    this.page = 0;
    this.cargarIncidencias();
  }

  // --- Opciones SelectSearch ---
  opcionesProyectos(): SelectOption[] {
    return this.proyectos.map((p: ProyectoResponse) => ({ value: String(p.id), label: `${p.codigo} - ${p.nombre}` }));
  }

  toValue(val: number | null | undefined): string {
    return val ? String(val) : '';
  }

  // --- Modal 1: Registrar Corrección (Dev) ---
  abrirModalCorreccion(inc: Incidencia): void {
    this.incidenciaSeleccionada = inc;
    this.error = null;
    this.correccionForm = {
      incidenciaId: inc.id,
      descripcion: '',
      commitHash: '',
      rama: `fix/${inc.codigo}`,
      versionCodigo: inc.versionBuild || ''
    };
    this.mostrarModalCorreccion = true;
  }

  cerrarModalCorreccion(): void {
    this.mostrarModalCorreccion = false;
    this.incidenciaSeleccionada = null;
  }

  guardarCorreccion(): void {
    if (!this.correccionForm.descripcion.trim()) {
      alert('La descripción del fix es obligatoria');
      return;
    }
    this.guardandoCorreccion = true;
    this.correccionRetestService.registrarCorreccion(this.correccionForm).subscribe({
      next: () => {
        this.guardandoCorreccion = false;
        this.cerrarModalCorreccion();
        this.cargarIncidencias();
        this.toast.success('Corrección registrada', 'La corrección se registró exitosamente.');
      },
      error: (err: any) => {
        alert(err.error?.message || 'Error al registrar corrección');
        this.guardandoCorreccion = false;
      }
    });
  }

  // --- Modal 2: Ejecutar Retest (QA) ---
  abrirModalRetest(inc: Incidencia): void {
    this.incidenciaSeleccionada = inc;
    this.error = null;
    this.retestForm = {
      incidenciaId: inc.id,
      resultado: 'APROBADO',
      observaciones: ''
    };
    this.mostrarModalRetest = true;
  }

  cerrarModalRetest(): void {
    this.mostrarModalRetest = false;
    this.incidenciaSeleccionada = null;
  }

  guardarRetest(): void {
    this.guardandoRetest = true;
    this.correccionRetestService.ejecutarRetest(this.retestForm).subscribe({
      next: () => {
        this.guardandoRetest = false;
        this.cerrarModalRetest();
        this.cargarIncidencias();
        this.toast.success('Retest registrado', 'El resultado del retest se registró exitosamente.');
      },
      error: (err: any) => {
        alert(err.error?.message || 'Error al ejecutar retest');
        this.guardandoRetest = false;
      }
    });
  }

  // --- Modal 3: Reabrir Incidencia (Auditoría) ---
  abrirModalReapertura(inc: Incidencia): void {
    this.incidenciaSeleccionada = inc;
    this.reaperturaForm = {
      incidenciaId: inc.id,
      motivo: ''
    };
    this.mostrarModalReapertura = true;
  }

  cerrarModalReapertura(): void {
    this.mostrarModalReapertura = false;
    this.incidenciaSeleccionada = null;
  }

  guardarReapertura(): void {
    if (!this.reaperturaForm.motivo.trim()) {
      alert('El motivo de reapertura es obligatorio para auditoría');
      return;
    }
    this.guardandoReapertura = true;
    this.correccionRetestService.reabrirIncidencia(this.reaperturaForm).subscribe({
      next: () => {
        this.guardandoReapertura = false;
        this.cerrarModalReapertura();
        this.cargarIncidencias();
        this.toast.success('Incidencia reabierta', 'La reapertura se registró exitosamente.');
      },
      error: (err: any) => {
        alert(err.error?.message || 'Error al reabrir incidencia');
        this.guardandoReapertura = false;
      }
    });
  }

  // --- Modal 4: Historial Completo del Defecto ---
  abrirModalHistorial(inc: Incidencia): void {
    this.incidenciaSeleccionada = inc;
    this.historialCorreccionesList = [];
    this.historialRetestsList = [];
    this.historialReaperturasList = [];
    this.cargandoHistorial = true;
    this.mostrarModalHistorial = true;

    this.correccionRetestService.historialCorrecciones(inc.id).subscribe({
      next: (res: any) => (this.historialCorreccionesList = res || []),
      error: () => {}
    });

    this.correccionRetestService.historialRetests(inc.id).subscribe({
      next: (res: any) => (this.historialRetestsList = res || []),
      error: () => {}
    });

    this.correccionRetestService.historialReaperturas(inc.id).subscribe({
      next: (res: any) => {
        this.historialReaperturasList = res || [];
        this.cargandoHistorial = false;
      },
      error: () => (this.cargandoHistorial = false)
    });
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.incidenciaSeleccionada = null;
  }

  // --- Helpers UI ---
  getEstadoBadge(estado: string) {
    switch (estado) {
      case 'RESUELTA':
        return { etiqueta: 'Lista para Retest', clase: 'badge-retest-listo', icono: 'published_with_changes' };
      case 'EN_RESOLUCION':
        return { etiqueta: 'En resolución', clase: 'badge-en-resolucion', icono: 'engineering' };
      case 'CERRADA':
        return { etiqueta: 'Cerrada / Validada', clase: 'badge-cerrada', icono: 'task_alt' };
      case 'ASIGNADA':
        return { etiqueta: 'Asignada a Dev', clase: 'badge-asignada', icono: 'assignment_ind' };
      default:
        return { etiqueta: estado, clase: 'badge-nueva', icono: 'fiber_new' };
    }
  }

  cambiarPagina(nueva: number): void {
    if (nueva >= 0 && nueva < this.totalPages) {
      this.page = nueva;
      this.cargarIncidencias();
    }
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}

