import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent, ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { RequerimientoService } from '../../../core/services/requerimiento.service';
import { Requerimiento, RequerimientoRequest, ModuloResponse } from '../../../core/models/requerimiento.model';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { ProyectoResponse } from '../../../core/models/proyecto.model';
import { UsuarioService, UsuarioListItem } from '../../../core/services/usuario.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { SelectSearchComponent, SelectOption } from '../../../shared/components/select-search/select-search.component';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'app-lista-requerimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, ModalComponent, SelectSearchComponent],
  templateUrl: './lista-requerimientos.component.html',
  styleUrls: ['./lista-requerimientos.component.css']
})
export class ListaRequerimientosComponent implements OnInit {
  String = String;
  requerimientos: Requerimiento[] = [];
  proyectos: ProyectoResponse[] = [];
  usuarios: UsuarioListItem[] = [];
  modulos: ModuloResponse[] = [];
  page = 0; size = 10; totalElements = 0; totalPages = 0;
  filtroBusqueda = ''; filtroProyecto: number | null = null; filtroEstado = ''; filtroPrioridad = '';
  cargando = false; guardando = false; error = '';
  mostrarModal = false; modoEdicion = false; editandoId: number | null = null;
  form: RequerimientoRequest = this.formularioInicial();
  private gridApi!: GridApi;

  gridOptions: GridOptions = { rowHeight: 52, headerHeight: 42, suppressCellFocus: true, suppressRowClickSelection: true, pagination: false };
  overlayNoRowsTemplate = '<span class="grid-empty">No se encontraron requerimientos</span>';
  defaultColDef: ColDef = { resizable: true, sortable: true, unSortIcon: true, suppressMovable: true };
  columnDefs: ColDef[] = [
    { headerName: 'Código', field: 'codigo', width: 140, cellRenderer: (p: any) => `<span class="badge-code">${p.value || ''}</span>` },
    { headerName: 'Requerimiento', field: 'descripcion', flex: 1, minWidth: 280, cellRenderer: (p: any) => `<div class="requirement-cell"><strong>${p.data?.descripcion || ''}</strong><span>${p.data?.proyectoNombre || 'Sin proyecto'}${p.data?.moduloNombre ? ' · ' + p.data.moduloNombre : ''}</span></div>` },
    { headerName: 'Tipo', field: 'tipo', width: 150, cellRenderer: (p: any) => `<span class="soft-badge">${this.etiqueta(p.value)}</span>` },
    { headerName: 'Prioridad', field: 'prioridad', width: 125, cellRenderer: (p: any) => `<span class="priority-badge priority-${(p.value || '').toLowerCase()}">${this.etiqueta(p.value)}</span>` },
    { headerName: 'Estado', field: 'estado', width: 165, cellRenderer: (p: any) => `<span class="status-badge status-${(p.value || '').toLowerCase()}"><span class="status-dot"></span>${this.etiqueta(p.value)}</span>` },
    { headerName: 'Versión', field: 'version', width: 90, cellRenderer: (p: any) => `<span class="version-badge">v${p.value || 1}</span>` },
    { headerName: 'Responsable', field: 'responsableNombre', width: 180, cellRenderer: (p: any) => p.value || '<span class="muted">Sin asignar</span>' },
    { headerName: 'Acciones', width: 92, sortable: false, cellRenderer: (p: any) => `<button class="action-btn" data-action="edit" data-id="${p.data?.id}" title="Editar requerimiento"><span class="material-symbols-outlined">edit</span></button>` }
  ];

  constructor(private service: RequerimientoService, private proyectoService: ProyectoService, private usuarioService: UsuarioService, private toast: ToastService) {}

  ngOnInit(): void { this.cargarCatalogos(); this.cargar(); }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    event.api.addEventListener('cellClicked', (e: any) => {
      const btn = e.event?.target?.closest('.action-btn');
      if (btn?.dataset.action === 'edit') this.abrirModal(Number(btn.dataset.id));
    });
  }

  cargarCatalogos(): void {
    this.proyectoService.listar(0, 1000).subscribe({ next: r => this.proyectos = r.content || [] });
    this.usuarioService.listar({ page: 0, size: 1000, estado: 'ACTIVO' }).subscribe({ next: r => this.usuarios = r.content || [] });
  }

  cargar(): void {
    this.cargando = true; this.error = ''; this.gridApi?.showLoadingOverlay();
    this.service.listar({ page: this.page, size: this.size, proyectoId: this.filtroProyecto || undefined, estado: this.filtroEstado, prioridad: this.filtroPrioridad, busqueda: this.filtroBusqueda }).subscribe({
      next: r => { this.requerimientos = r.content; this.totalElements = r.totalElements; this.totalPages = r.totalPages; this.cargando = false; this.gridApi?.hideOverlay(); if (!this.requerimientos.length) this.gridApi?.showNoRowsOverlay(); },
      error: () => { this.cargando = false; this.error = 'No se pudieron cargar los requerimientos.'; this.gridApi?.hideOverlay(); }
    });
  }

  aplicarFiltros(): void { this.page = 0; this.cargar(); }
  limpiarFiltros(): void { this.filtroBusqueda = ''; this.filtroProyecto = null; this.filtroEstado = ''; this.filtroPrioridad = ''; this.aplicarFiltros(); }
  cambiarPagina(p: number): void { if (p >= 0 && p < this.totalPages) { this.page = p; this.cargar(); } }
  cambiarTamano(e: Event): void { this.size = Number((e.target as HTMLSelectElement).value); this.page = 0; this.cargar(); }
  etiqueta(v: string | null | undefined): string { const t = (v || '').replace(/_/g, ' ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); }
  min(a: number, b: number): number { return Math.min(a, b); }

  abrirModal(id?: number): void {
    this.modoEdicion = !!id; this.editandoId = id || null; this.error = '';
    if (id) this.service.buscarPorId(id).subscribe({ next: r => { this.form = this.aRequest(r); this.cargarModulos(); this.mostrarModal = true; }, error: () => this.error = 'No se pudo cargar el requerimiento.' });
    else { this.form = this.formularioInicial(); this.modulos = []; this.mostrarModal = true; }
  }
  cerrarModal(): void { if (!this.guardando) { this.mostrarModal = false; this.editandoId = null; this.nuevoModuloVisible = false; this.nuevoModuloNombre = ''; } }
  nuevoModuloVisible = false; nuevoModuloNombre = ''; creandoModulo = false;
  abrirNuevoModulo(): void {
    if (!this.form.proyectoId) { this.error = 'Selecciona primero un proyecto para crear su módulo.'; return; }
    this.error = ''; this.nuevoModuloVisible = true;
  }
  crearModulo(): void {
    const nombre = this.nuevoModuloNombre.trim();
    if (!this.form.proyectoId) { this.error = 'Selecciona primero un proyecto.'; return; }
    if (!nombre) { this.error = 'Ingresa el nombre del módulo.'; return; }
    this.creandoModulo = true; this.error = '';
    this.service.crearModulo({ proyectoId: this.form.proyectoId, nombre }).subscribe({
      next: m => { this.creandoModulo = false; this.modulos = [...this.modulos, m]; this.form.moduloId = m.id; this.nuevoModuloNombre = ''; this.nuevoModuloVisible = false; },
      error: err => { this.creandoModulo = false; this.error = err?.error?.error || err?.error?.message || 'No se pudo crear el módulo.'; }
    });
  }
  cargarModulos(): void { this.modulos = []; if (this.form.proyectoId) this.service.listarModulos(this.form.proyectoId).subscribe({ next: m => this.modulos = m }); }
  guardar(): void {
    if (!this.form.codigo.trim() || !this.form.descripcion.trim() || !this.form.proyectoId || !this.form.tipo || !this.form.prioridad) { this.error = 'Completa los campos obligatorios.'; return; }
    this.guardando = true; this.error = '';
    const request = { ...this.form, moduloId: this.form.moduloId || null, responsableId: this.form.responsableId || null };
    const call = this.editandoId ? this.service.editar(this.editandoId, request) : this.service.crear(request);
    call.subscribe({ next: () => { const edit = !!this.editandoId; this.guardando = false; this.cerrarModal(); this.cargar(); this.toast.success(edit ? 'Requerimiento actualizado' : 'Requerimiento creado', edit ? 'Los cambios se guardaron exitosamente.' : 'El requerimiento se ha registrado exitosamente.'); }, error: err => { this.guardando = false; this.error = err?.error?.message || 'No se pudo guardar el requerimiento.'; } });
  }
  private formularioInicial(): RequerimientoRequest { return { codigo: '', proyectoId: 0, moduloId: null, descripcion: '', tipo: 'FUNCIONAL', prioridad: 'MEDIA', estado: 'PENDIENTE', responsableId: null }; }
  private aRequest(r: Requerimiento): RequerimientoRequest { return { codigo: r.codigo, proyectoId: r.proyectoId, moduloId: r.moduloId || null, descripcion: r.descripcion, tipo: r.tipo, prioridad: r.prioridad, estado: r.estado, responsableId: r.responsableId || null }; }
  opcionesProyectos(): SelectOption[] { return this.proyectos.map(p => ({ value: String(p.id), label: `${p.codigo} · ${p.nombre}` })); }
  opcionesModulos(): SelectOption[] { return this.modulos.map(m => ({ value: String(m.id), label: m.nombre })); }
  opcionesUsuarios(): SelectOption[] { return this.usuarios.map(u => ({ value: String(u.id), label: `${u.nombres} ${u.apellidos}` })); }
  seleccionarProyecto(value: string): void { this.form.proyectoId = Number(value) || 0; this.form.moduloId = null; this.cargarModulos(); }
  seleccionarModulo(value: string): void { this.form.moduloId = Number(value) || null; }
  seleccionarResponsable(value: string): void { this.form.responsableId = Number(value) || null; }
  toValue(value: number | null | undefined): string { return value ? String(value) : ''; }
  opcionesTipo(): SelectOption[] { return [{value:'FUNCIONAL',label:'Funcional'},{value:'NO_FUNCIONAL',label:'No funcional'},{value:'REGLA_NEGOCIO',label:'Regla de negocio'},{value:'TECNICO',label:'Técnico'}]; }
  opcionesPrioridad(): SelectOption[] { return [{value:'ALTA',label:'Alta'},{value:'MEDIA',label:'Media'},{value:'BAJA',label:'Baja'}]; }
  opcionesEstado(): SelectOption[] { return [{value:'PENDIENTE',label:'Pendiente'},{value:'EN_PROGRESO',label:'En progreso'},{value:'APROBADO',label:'Aprobado'},{value:'RECHAZADO',label:'Rechazado'}]; }
  seleccionarTipo(value: string): void { this.form.tipo = value; }
  seleccionarPrioridad(value: string): void { this.form.prioridad = value; }
  seleccionarEstado(value: string): void { this.form.estado = value; }
  seleccionarFiltroProyecto(value: string): void { this.filtroProyecto = Number(value) || null; this.aplicarFiltros(); }
  seleccionarFiltroPrioridad(value: string): void { this.filtroPrioridad = value; this.aplicarFiltros(); }
  seleccionarFiltroEstado(value: string): void { this.filtroEstado = value; this.aplicarFiltros(); }
}
