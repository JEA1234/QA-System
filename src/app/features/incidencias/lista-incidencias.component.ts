import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciaService } from '../../core/services/incidencia.service';
import { ProyectoService } from '../../core/services/proyecto.service';
import { ToastService } from '../../core/services/toast.service';
import { RequerimientoService } from '../../core/services/requerimiento.service';
import { UsuarioService, UsuarioListItem } from '../../core/services/usuario.service';
import {
  Incidencia,
  IncidenciaRequest,
  IncidenciaEvidencia,
  IncidenciaComentario
} from '../../core/models/incidencia.model';
import { ProyectoResponse } from '../../core/models/proyecto.model';
import { Requerimiento } from '../../core/models/requerimiento.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SelectSearchComponent, SelectOption } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-lista-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, SelectSearchComponent],
  templateUrl: './lista-incidencias.component.html',
  styleUrls: ['./lista-incidencias.component.css']
})
export class ListaIncidenciasComponent implements OnInit {
  incidencias: Incidencia[] = [];
  cargando = false;
  guardando = false;
  error: string | null = null;

  // Paginación
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  // Filtros
  filtroProyecto: number | null = null;
  filtroRequerimiento: number | null = null;
  filtroEstado = '';
  filtroSeveridad = '';
  filtroPrioridad = '';
  filtroResponsable: number | null = null;
  filtroBusqueda = '';

  // Datos para selects
  proyectos: ProyectoResponse[] = [];
  requerimientos: Requerimiento[] = [];
  desarrolladores: UsuarioListItem[] = [];

  // Modales
  mostrarModalForm = false;
  mostrarModalDetalle = false;
  mostrarModalEvidencias = false;
  modoEdicion = false;
  incidenciaSeleccionada: Incidencia | null = null;

  // Formulario creación / edición
  form: IncidenciaRequest = {
    codigo: '',
    proyectoId: 0,
    requerimientoId: null,
    titulo: '',
    descripcion: '',
    severidad: 'MEDIA',
    prioridad: 'MEDIA',
    estado: 'NUEVA',
    responsableId: null,
    versionBuild: ''
  };

  // Evidencias
  evidencias: IncidenciaEvidencia[] = [];
  archivoEvidencia: File | null = null;
  subiendoArchivo = false;

  // Comentarios / Discusión
  comentarios: IncidenciaComentario[] = [];
  nuevoComentario = '';
  enviandoComentario = false;

  readonly severidadesDisponibles = [
    { valor: 'CRITICA', etiqueta: 'Crítica (SLA: 24h)', clase: 'badge-critica', icono: 'dangerous' },
    { valor: 'MAYOR', etiqueta: 'Mayor (SLA: 48h)', clase: 'badge-mayor', icono: 'warning' },
    { valor: 'MENOR', etiqueta: 'Menor (SLA: 5 días)', clase: 'badge-menor', icono: 'info' },
    { valor: 'TRIVIAL', etiqueta: 'Trivial (SLA: 10 días)', clase: 'badge-trivial', icono: 'low_priority' }
  ];

  readonly prioridadesDisponibles = [
    { valor: 'ALTA', etiqueta: 'Alta', clase: 'badge-prioridad-alta' },
    { valor: 'MEDIA', etiqueta: 'Media', clase: 'badge-prioridad-media' },
    { valor: 'BAJA', etiqueta: 'Baja', clase: 'badge-prioridad-baja' }
  ];

  readonly estadosDisponibles = [
    { valor: 'NUEVA', etiqueta: 'Nueva', clase: 'badge-nueva', icono: 'fiber_new' },
    { valor: 'ASIGNADA', etiqueta: 'Asignada', clase: 'badge-asignada', icono: 'assignment_ind' },
    { valor: 'EN_RESOLUCION', etiqueta: 'En resolución', clase: 'badge-en-resolucion', icono: 'engineering' },
    { valor: 'RESUELTA', etiqueta: 'Resuelta', clase: 'badge-resuelta', icono: 'check_circle' },
    { valor: 'CERRADA', etiqueta: 'Cerrada', clase: 'badge-cerrada', icono: 'task_alt' },
    { valor: 'RECHAZADA', etiqueta: 'Rechazada', clase: 'badge-rechazada', icono: 'cancel' }
  ];

  constructor(
    private incidenciaService: IncidenciaService,
    private proyectoService: ProyectoService,
    private requerimientoService: RequerimientoService,
    private usuarioService: UsuarioService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarIncidencias();
  }

  cargarCatalogos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => (this.proyectos = res.content || []),
      error: () => {}
    });

    this.usuarioService.listar({ page: 0, size: 200, estado: 'ACTIVO' }).subscribe({
      next: (res: any) => {
        const users: UsuarioListItem[] = res.content || [];
        // Filtramos usuarios desarrolladores o con rol dev/admin/lider
        this.desarrolladores = users.filter((u: UsuarioListItem) =>
          u.roles.some((r: string) => ['DESARROLLADOR', 'ADMINISTRADOR', 'LIDER_QA'].includes(r))
        );
      },
      error: () => {}
    });
  }

  cargarRequerimientosDelProyecto(proyectoId: number): void {
    if (!proyectoId) {
      this.requerimientos = [];
      return;
    }
    this.requerimientoService.listar({ page: 0, size: 200, proyectoId }).subscribe({
      next: (res: any) => (this.requerimientos = res.content || []),
      error: () => {}
    });
  }

  cargarIncidencias(): void {
    this.cargando = true;
    this.error = null;
    this.incidenciaService
      .listar({
        page: this.page,
        size: this.size,
        proyectoId: this.filtroProyecto || undefined,
        requerimientoId: this.filtroRequerimiento || undefined,
        estado: this.filtroEstado || undefined,
        severidad: this.filtroSeveridad || undefined,
        prioridad: this.filtroPrioridad || undefined,
        responsableId: this.filtroResponsable || undefined,
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

  aplicarFiltros(): void {
    this.page = 0;
    this.cargarIncidencias();
  }

  limpiarFiltros(): void {
    this.filtroProyecto = null;
    this.filtroRequerimiento = null;
    this.filtroEstado = '';
    this.filtroSeveridad = '';
    this.filtroPrioridad = '';
    this.filtroResponsable = null;
    this.filtroBusqueda = '';
    this.page = 0;
    this.requerimientos = [];
    this.cargarIncidencias();
  }

  seleccionarProyectoFiltro(val: string): void {
    this.filtroProyecto = val ? Number(val) : null;
    this.filtroRequerimiento = null;
    if (this.filtroProyecto) {
      this.cargarRequerimientosDelProyecto(this.filtroProyecto);
    } else {
      this.requerimientos = [];
    }
    this.aplicarFiltros();
  }

  // --- Opciones SelectSearch ---
  opcionesProyectos(): SelectOption[] {
    return this.proyectos.map((p: ProyectoResponse) => ({ value: String(p.id), label: `${p.codigo} - ${p.nombre}` }));
  }

  opcionesRequerimientos(): SelectOption[] {
    return this.requerimientos.map((r: Requerimiento) => ({ value: String(r.id), label: `${r.codigo}: ${r.descripcion}` }));
  }

  opcionesDesarrolladores(): SelectOption[] {
    return this.desarrolladores.map((u: UsuarioListItem) => ({
      value: String(u.id),
      label: `${u.nombres} ${u.apellidos}`
    }));
  }

  opcionesEstados(): SelectOption[] {
    return this.estadosDisponibles.map((e: any) => ({ value: e.valor, label: e.etiqueta }));
  }

  opcionesSeveridades(): SelectOption[] {
    return this.severidadesDisponibles.map((s: any) => ({ value: s.valor, label: s.etiqueta }));
  }

  opcionesPrioridades(): SelectOption[] {
    return this.prioridadesDisponibles.map((p: any) => ({ value: p.valor, label: p.etiqueta }));
  }

  toValue(val: number | null | undefined): string {
    return val ? String(val) : '';
  }

  // --- Modal Formulario Crear / Editar ---
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.incidenciaSeleccionada = null;
    this.error = null;
    this.form = {
      codigo: '',
      proyectoId: this.proyectos.length ? this.proyectos[0].id : 0,
      requerimientoId: null,
      titulo: '',
      descripcion: '',
      severidad: 'MEDIA',
      prioridad: 'MEDIA',
      estado: 'NUEVA',
      responsableId: null,
      versionBuild: ''
    };
    if (this.form.proyectoId) {
      this.cargarRequerimientosDelProyecto(this.form.proyectoId);
    }
    this.mostrarModalForm = true;
  }

  abrirModalEditar(inc: Incidencia): void {
    this.modoEdicion = true;
    this.incidenciaSeleccionada = inc;
    this.error = null;
    this.form = {
      codigo: inc.codigo,
      proyectoId: inc.proyectoId,
      requerimientoId: inc.requerimientoId,
      titulo: inc.titulo,
      descripcion: inc.descripcion,
      severidad: inc.severidad,
      prioridad: inc.prioridad,
      estado: inc.estado,
      responsableId: inc.responsableId,
      versionBuild: inc.versionBuild || ''
    };
    this.cargarRequerimientosDelProyecto(inc.proyectoId);
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.incidenciaSeleccionada = null;
  }

  onProyectoFormChange(val: string): void {
    this.form.proyectoId = Number(val);
    this.form.requerimientoId = null;
    if (this.form.proyectoId) {
      this.cargarRequerimientosDelProyecto(this.form.proyectoId);
    } else {
      this.requerimientos = [];
    }
  }

  guardarIncidencia(): void {
    if (!this.form.proyectoId || !this.form.titulo.trim() || !this.form.descripcion.trim()) {
      this.error = 'Proyecto, título y descripción son obligatorios.';
      return;
    }

    this.guardando = true;
    this.error = null;

    const op = this.modoEdicion && this.incidenciaSeleccionada
      ? this.incidenciaService.editar(this.incidenciaSeleccionada.id, this.form)
      : this.incidenciaService.crear(this.form);

    op.subscribe({
      next: () => {
        const edit = this.modoEdicion;
        this.guardando = false;
        this.cerrarModalForm();
        this.cargarIncidencias();
        this.toast.success(edit ? 'Incidencia actualizada' : 'Incidencia registrada', edit ? 'Los cambios se guardaron exitosamente.' : 'La incidencia se ha registrado exitosamente.');
      },
      error: (err: any) => {
        this.guardando = false;
        this.error = err.error?.message || 'Error al guardar la incidencia.';
      }
    });
  }

  // --- Modal Detalle & Comentarios (RQ-MOD07-08) ---
  abrirModalDetalle(inc: Incidencia): void {
    this.incidenciaSeleccionada = inc;
    this.comentarios = [];
    this.nuevoComentario = '';
    this.mostrarModalDetalle = true;
    this.cargarComentarios(inc.id);
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.incidenciaSeleccionada = null;
    this.comentarios = [];
  }

  cargarComentarios(id: number): void {
    this.incidenciaService.listarComentarios(id).subscribe({
      next: (list: any) => (this.comentarios = list || []),
      error: () => {}
    });
  }

  enviarComentario(): void {
    if (!this.nuevoComentario.trim() || !this.incidenciaSeleccionada) return;

    this.enviandoComentario = true;
    this.incidenciaService
      .agregarComentario(this.incidenciaSeleccionada.id, { comentario: this.nuevoComentario.trim() })
      .subscribe({
        next: (c: any) => {
          this.comentarios.push(c);
          this.nuevoComentario = '';
          this.enviandoComentario = false;
        },
        error: (err: any) => {
          alert(err.error?.message || 'Error al agregar comentario');
          this.enviandoComentario = false;
        }
      });
  }

  cambiarEstadoDirecto(nuevoEstado: string): void {
    if (!this.incidenciaSeleccionada) return;
    this.incidenciaService.cambiarEstado(this.incidenciaSeleccionada.id, nuevoEstado).subscribe({
      next: (actualizada: Incidencia) => {
        this.incidenciaSeleccionada = actualizada;
        this.cargarIncidencias();
      },
      error: (err: any) => alert(err.error?.message || 'Error al cambiar estado')
    });
  }

  // --- Modal Evidencias (RQ-MOD07-06) ---
  abrirModalEvidencias(inc: Incidencia): void {
    this.incidenciaSeleccionada = inc;
    this.evidencias = inc.evidencias || [];
    this.archivoEvidencia = null;
    this.mostrarModalEvidencias = true;
  }

  cerrarModalEvidencias(): void {
    this.mostrarModalEvidencias = false;
    this.incidenciaSeleccionada = null;
    this.archivoEvidencia = null;
  }

  seleccionarArchivo(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('El archivo no debe superar los 15 MB.');
        return;
      }
      this.archivoEvidencia = file;
    }
  }

  subirEvidencia(): void {
    if (!this.archivoEvidencia || !this.incidenciaSeleccionada) return;

    this.subiendoArchivo = true;
    this.incidenciaService.subirEvidencia(this.incidenciaSeleccionada.id, this.archivoEvidencia).subscribe({
      next: (nueva: any) => {
        this.evidencias.push(nueva);
        this.archivoEvidencia = null;
        this.subiendoArchivo = false;
        this.cargarIncidencias();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Error al subir la evidencia');
        this.subiendoArchivo = false;
      }
    });
  }

  eliminarEvidencia(ev: IncidenciaEvidencia): void {
    if (!this.incidenciaSeleccionada) return;
    if (!confirm(`¿Eliminar la evidencia "${ev.nombre}"?`)) return;

    this.incidenciaService.eliminarEvidencia(this.incidenciaSeleccionada.id, ev.id).subscribe({
      next: () => {
        this.evidencias = this.evidencias.filter((x: any) => x.id !== ev.id);
        this.cargarIncidencias();
      },
      error: () => alert('No se pudo eliminar la evidencia')
    });
  }

  formatearTamano(bytes?: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // --- Helpers UI ---
  getSeveridadInfo(sev: string) {
    return (
      this.severidadesDisponibles.find((s: any) => s.valor === sev) || {
        valor: sev,
        etiqueta: sev,
        clase: 'badge-menor',
        icono: 'info'
      }
    );
  }

  getEstadoInfo(est: string) {
    return (
      this.estadosDisponibles.find((e: any) => e.valor === est) || {
        valor: est,
        etiqueta: est,
        clase: 'badge-nueva',
        icono: 'fiber_new'
      }
    );
  }

  getPrioridadInfo(pri: string) {
    return (
      this.prioridadesDisponibles.find((p: any) => p.valor === pri) || {
        valor: pri,
        etiqueta: pri,
        clase: 'badge-prioridad-media'
      }
    );
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

