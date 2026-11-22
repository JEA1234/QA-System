import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ClientSideRowModelModule, ColDef, GridApi, GridOptions, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { CasoPrueba, CasoPruebaRequest, CasoVersionResponse, PasoRequest, SuitePrueba, SuiteRequest } from '../../../core/models/caso-prueba.model';
import { CasoPruebaService } from '../../../core/services/caso-prueba.service';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { ProyectoResponse } from '../../../core/models/proyecto.model';
import { RequerimientoService } from '../../../core/services/requerimiento.service';
import { Requerimiento } from '../../../core/models/requerimiento.model';
import { UsuarioListItem, UsuarioService } from '../../../core/services/usuario.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SelectOption, SelectSearchComponent } from '../../../shared/components/select-search/select-search.component';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'app-lista-casos-prueba',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, ModalComponent, SelectSearchComponent],
  templateUrl: './lista-casos-prueba.component.html',
  styleUrls: ['./lista-casos-prueba.component.css']
})
export class ListaCasosPruebaComponent implements OnInit {
  casos: CasoPrueba[] = [];
  proyectos: ProyectoResponse[] = [];
  requerimientos: Requerimiento[] = [];
  testers: UsuarioListItem[] = [];
  versiones: CasoVersionResponse[] = [];
  suites: SuitePrueba[] = [];
  page = 0; size = 10; totalElements = 0; totalPages = 0;
  filtroBusqueda = ''; filtroProyecto: number | null = null; filtroRequerimiento: number | null = null;
  filtroTipo = ''; filtroPrioridad = ''; filtroEstado = ''; filtroTester: number | null = null;
  cargando = false; guardando = false; error = '';
  mostrarModal = false; mostrarVersiones = false; mostrarSuites = false; modoEdicion = false; editandoId: number | null = null;
  suiteGuardando = false; suiteError = ''; suiteForm: SuiteRequest = this.suiteInicial();
  form: CasoPruebaRequest = this.formularioInicial();
  private gridApi!: GridApi;

  gridOptions: GridOptions = { rowHeight: 56, headerHeight: 42, suppressCellFocus: true, suppressRowClickSelection: true, pagination: false };
  overlayNoRowsTemplate = '<span class="grid-empty">No se encontraron casos de prueba</span>';
  defaultColDef: ColDef = { resizable: true, sortable: true, unSortIcon: true, suppressMovable: true };
  columnDefs: ColDef[] = [
    { headerName: 'Código', field: 'codigo', width: 130, cellRenderer: (p: any) => `<span class="badge-code">${p.value || ''}</span>` },
    { headerName: 'Caso de prueba', field: 'nombre', flex: 1, minWidth: 250, cellRenderer: (p: any) => `<div class="case-cell"><strong>${p.data?.nombre || ''}</strong><span>${p.data?.requerimientoCodigo || 'Sin requerimiento'} · v${p.data?.version || 1}</span></div>` },
    { headerName: 'Tipo', field: 'tipo', width: 145, cellRenderer: (p: any) => `<span class="soft-badge">${this.etiqueta(p.value)}</span>` },
    { headerName: 'Prioridad', field: 'prioridad', width: 120, cellRenderer: (p: any) => `<span class="priority-badge priority-${(p.value || '').toLowerCase()}">${this.etiqueta(p.value)}</span>` },
    { headerName: 'Estado', field: 'estado', width: 135, cellRenderer: (p: any) => `<span class="status-badge status-${(p.value || '').toLowerCase()}"><span class="status-dot"></span>${this.etiqueta(p.value)}</span>` },
    { headerName: 'Tester', field: 'testerNombre', width: 175, cellRenderer: (p: any) => p.value || '<span class="muted">Sin asignar</span>' },
    { headerName: 'Acciones', width: 145, sortable: false, cellRenderer: (p: any) => `<button class="action-btn" data-action="edit" data-id="${p.data?.id}" title="Editar"><span class="material-symbols-outlined">edit</span></button><button class="action-btn" data-action="versions" data-id="${p.data?.id}" title="Ver versiones"><span class="material-symbols-outlined">history</span></button><button class="action-btn danger-action" data-action="deactivate" data-id="${p.data?.id}" title="Desactivar"><span class="material-symbols-outlined">block</span></button>` }
  ];

  constructor(private service: CasoPruebaService, private proyectoService: ProyectoService, private requerimientoService: RequerimientoService, private usuarioService: UsuarioService, private toast: ToastService) {}

  ngOnInit(): void { this.cargarCatalogos(); this.cargar(); }

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    event.api.addEventListener('cellClicked', (e: any) => {
      const button = e.event?.target?.closest('.action-btn');
      if (!button) return;
      const id = Number(button.dataset.id);
      if (button.dataset.action === 'edit') this.abrirModal(id);
      if (button.dataset.action === 'versions') this.verVersiones(id);
      if (button.dataset.action === 'deactivate') this.desactivar(id);
    });
  }

  cargarCatalogos(): void {
    this.proyectoService.listar(0, 1000).subscribe({ next: r => this.proyectos = r.content || [] });
    this.requerimientoService.listar({ page: 0, size: 1000 }).subscribe({ next: r => this.requerimientos = r.content || [] });
    this.usuarioService.listar({ page: 0, size: 1000, estado: 'ACTIVO' }).subscribe({ next: r => this.testers = (r.content || []).filter(u => u.roles?.some(role => /TESTER|QA|ANALISTA/i.test(role))) });
  }

  cargar(): void {
    this.cargando = true; this.error = ''; this.gridApi?.showLoadingOverlay();
    this.service.listar({ page: this.page, size: this.size, proyectoId: this.filtroProyecto || undefined, requerimientoId: this.filtroRequerimiento || undefined, tipo: this.filtroTipo, prioridad: this.filtroPrioridad, estado: this.filtroEstado, testerId: this.filtroTester || undefined, busqueda: this.filtroBusqueda }).subscribe({
      next: r => { this.casos = r.content || []; this.totalElements = r.totalElements; this.totalPages = r.totalPages; this.cargando = false; this.gridApi?.hideOverlay(); if (!this.casos.length) this.gridApi?.showNoRowsOverlay(); },
      error: err => { this.cargando = false; this.error = err?.error?.message || 'No se pudieron cargar los casos de prueba.'; this.gridApi?.hideOverlay(); }
    });
  }

  aplicarFiltros(): void { this.page = 0; this.cargar(); }
  limpiarFiltros(): void { this.filtroBusqueda = ''; this.filtroProyecto = null; this.filtroRequerimiento = null; this.filtroTipo = ''; this.filtroPrioridad = ''; this.filtroEstado = ''; this.filtroTester = null; this.aplicarFiltros(); }
  cambiarPagina(page: number): void { if (page >= 0 && page < this.totalPages) { this.page = page; this.cargar(); } }
  cambiarTamano(event: Event): void { this.size = Number((event.target as HTMLSelectElement).value); this.page = 0; this.cargar(); }
  min(a: number, b: number): number { return Math.min(a, b); }

  abrirModal(id?: number): void {
    this.error = ''; this.modoEdicion = !!id; this.editandoId = id || null;
    if (id) this.service.buscarPorId(id).subscribe({ next: r => { this.form = this.aRequest(r); this.mostrarModal = true; }, error: err => this.error = err?.error?.message || 'No se pudo cargar el caso.' });
    else { this.form = this.formularioInicial(); this.mostrarModal = true; }
  }

  cerrarModal(): void { if (!this.guardando) { this.mostrarModal = false; this.editandoId = null; } }
  guardar(): void {
    if (!this.form.codigo.trim() || !this.form.nombre.trim() || !this.form.objetivo.trim() || !this.form.requerimientoId || !this.form.tipo || !this.form.prioridad) { this.error = 'Completa los campos obligatorios.'; return; }
    if (this.form.pasos.some(p => !p.accion.trim() || !p.resultadoEsperado.trim())) { this.error = 'Completa la acción y el resultado esperado de cada paso.'; return; }
    this.guardando = true; this.error = '';
    const call = this.editandoId ? this.service.editar(this.editandoId, this.form) : this.service.crear(this.form);
    call.subscribe({ next: () => { const edit = !!this.editandoId; this.guardando = false; this.cerrarModal(); this.cargar(); this.toast.success(edit ? 'Caso de prueba actualizado' : 'Caso de prueba creado', edit ? 'Los cambios se guardaron exitosamente.' : 'El caso de prueba se ha registrado exitosamente.'); }, error: err => { this.guardando = false; this.error = err?.error?.message || 'No se pudo guardar el caso de prueba.'; } });
  }

  agregarPaso(): void { this.form.pasos.push({ numero: this.form.pasos.length + 1, accion: '', datoEntrada: '', resultadoEsperado: '' }); }
  quitarPaso(index: number): void { this.form.pasos.splice(index, 1); this.form.pasos.forEach((p, i) => p.numero = i + 1); }
  verVersiones(id: number): void { this.error = ''; this.service.versiones(id).subscribe({ next: v => { this.versiones = v; this.mostrarVersiones = true; }, error: () => this.error = 'No se pudo cargar el historial de versiones.' }); }
  cerrarVersiones(): void { this.mostrarVersiones = false; }
  abrirSuites(): void { this.suiteError = ''; this.suiteForm = this.suiteInicial(); this.suites = []; this.mostrarSuites = true; this.service.listarSuites().subscribe({ next: s => this.suites = s, error: err => this.suiteError = err?.error?.message || 'No se pudieron cargar las suites. Verifica los permisos y el backend.' }); }
  cerrarSuites(): void { if (!this.suiteGuardando) this.mostrarSuites = false; }
  crearSuite(): void { if (!this.suiteForm.nombre.trim()) { this.suiteError = 'Escribe un nombre para la suite.'; return; } this.suiteGuardando = true; this.suiteError = ''; this.service.crearSuite(this.suiteForm).subscribe({ next: suite => { this.suites = [suite, ...this.suites]; this.suiteForm = this.suiteInicial(); this.suiteGuardando = false; }, error: err => { this.suiteGuardando = false; this.suiteError = err?.error?.message || 'No se pudo crear la suite.'; } }); }
  alternarCasoSuite(id: number): void { const index = this.suiteForm.casoIds.indexOf(id); if (index >= 0) this.suiteForm.casoIds.splice(index, 1); else this.suiteForm.casoIds.push(id); }
  casoEnSuite(id: number): boolean { return this.suiteForm.casoIds.includes(id); }
  desactivar(id: number): void { this.service.cambiarEstado(id, 'INACTIVO').subscribe({ next: () => { this.cargar(); this.toast.success('Caso de prueba desactivado', 'El caso se desactivó correctamente.'); }, error: err => this.error = err?.error?.message || 'No se pudo desactivar el caso.' }); }

  opcionesProyectos(): SelectOption[] { return this.proyectos.map(p => ({ value: String(p.id), label: `${p.codigo} · ${p.nombre}` })); }
  opcionesRequerimientos(): SelectOption[] { return this.requerimientos.filter(r => !this.form.requerimientoId || true).map(r => ({ value: String(r.id), label: `${r.codigo} · ${r.descripcion}` })); }
  opcionesTesters(): SelectOption[] { return this.testers.map(u => ({ value: String(u.id), label: `${u.nombres} ${u.apellidos}` })); }
  opcionesTipo(): SelectOption[] { return [{ value: 'FUNCIONAL', label: 'Funcional' }, { value: 'NO_FUNCIONAL', label: 'No funcional' }, { value: 'REGRESION', label: 'Regresión' }, { value: 'AUTOMATIZABLE', label: 'Automatizable' }]; }
  opcionesPrioridad(): SelectOption[] { return [{ value: 'ALTA', label: 'Alta' }, { value: 'MEDIA', label: 'Media' }, { value: 'BAJA', label: 'Baja' }]; }
  opcionesEstado(): SelectOption[] { return [{ value: 'ACTIVO', label: 'Activo' }, { value: 'EN_PROGRESO', label: 'En progreso' }, { value: 'APROBADO', label: 'Aprobado' }, { value: 'INACTIVO', label: 'Inactivo' }]; }
  toValue(value: number | null | undefined): string { return value ? String(value) : ''; }
  etiqueta(value: string | undefined): string { const t = (value || '').replace(/_/g, ' ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); }
  seleccionarProyecto(value: string): void { this.filtroProyecto = Number(value) || null; this.aplicarFiltros(); }
  seleccionarRequerimientoFiltro(value: string): void { this.filtroRequerimiento = Number(value) || null; this.aplicarFiltros(); }
  seleccionarTesterFiltro(value: string): void { this.filtroTester = Number(value) || null; this.aplicarFiltros(); }
  seleccionarTipoFiltro(value: string): void { this.filtroTipo = value; this.aplicarFiltros(); }
  seleccionarPrioridadFiltro(value: string): void { this.filtroPrioridad = value; this.aplicarFiltros(); }
  seleccionarEstadoFiltro(value: string): void { this.filtroEstado = value; this.aplicarFiltros(); }
  seleccionarRequerimiento(value: string): void { this.form.requerimientoId = Number(value) || 0; }
  seleccionarTipo(value: string): void { this.form.tipo = value; }
  seleccionarPrioridad(value: string): void { this.form.prioridad = value; }
  seleccionarEstado(value: string): void { this.form.estado = value; }
  seleccionarTester(value: string): void { this.form.testerId = Number(value) || null; }

  private formularioInicial(): CasoPruebaRequest { return { codigo: '', requerimientoId: 0, nombre: '', objetivo: '', precondiciones: '', prioridad: 'MEDIA', estado: 'ACTIVO', tipo: 'FUNCIONAL', testerId: null, pasos: [{ numero: 1, accion: '', datoEntrada: '', resultadoEsperado: '' }] }; }
  private suiteInicial(): SuiteRequest { return { nombre: '', descripcion: '', estado: 'ACTIVA', casoIds: [] }; }
  private aRequest(c: CasoPrueba): CasoPruebaRequest { return { codigo: c.codigo, requerimientoId: c.requerimientoId, nombre: c.nombre, objetivo: c.objetivo, precondiciones: c.precondiciones || '', prioridad: c.prioridad, estado: c.estado, tipo: c.tipo, testerId: c.testerId || null, pasos: (c.pasos || []).map(p => ({ numero: p.numero, accion: p.accion, datoEntrada: p.datoEntrada || '', resultadoEsperado: p.resultadoEsperado })) }; }
}
