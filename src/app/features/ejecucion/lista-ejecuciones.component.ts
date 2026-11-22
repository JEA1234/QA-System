import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EjecucionService } from '../../core/services/ejecucion.service';
import { CasoPruebaService } from '../../core/services/caso-prueba.service';
import { ProyectoService } from '../../core/services/proyecto.service';
import { ToastService } from '../../core/services/toast.service';
import {
  Ejecucion,
  EjecucionRequest,
  Evidencia,
  AmbientePrueba,
  AmbienteRequest,
  CicloPrueba,
  CicloPruebaRequest
} from '../../core/models/ejecucion.model';
import { CasoPrueba } from '../../core/models/caso-prueba.model';
import { ProyectoResponse } from '../../core/models/proyecto.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SelectSearchComponent, SelectOption } from '../../shared/components/select-search/select-search.component';

@Component({
  selector: 'app-lista-ejecuciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, SelectSearchComponent],
  templateUrl: './lista-ejecuciones.component.html',
  styleUrls: ['./lista-ejecuciones.component.css']
})
export class ListaEjecucionesComponent implements OnInit, OnDestroy {
  ejecuciones: Ejecucion[] = [];
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
  filtroAmbiente: number | null = null;
  filtroCiclo: number | null = null;
  filtroResultado = '';
  filtroBusqueda = '';

  // Datos de apoyo para selects
  proyectos: ProyectoResponse[] = [];
  ambientes: AmbientePrueba[] = [];
  ciclos: CicloPrueba[] = [];
  casosPrueba: CasoPrueba[] = [];

  // Estados de modal
  mostrarModalEjecutar = false;
  mostrarModalEvidencias = false;
  mostrarModalHistorial = false;
  mostrarModalAmbientes = false;
  mostrarModalCiclos = false;

  // Formulario ejecución
  formEjecutar: EjecucionRequest = {
    casoId: 0,
    ambienteId: null,
    cicloId: null,
    resultado: 'PENDIENTE',
    duracionSegundos: 0,
    observaciones: ''
  };
  ejecucionEnEdicionId: number | null = null;

  // Cronómetro
  cronometroActivo = false;
  segundosTranscurridos = 0;
  private intervaloTimer: any = null;

  // Evidencias
  ejecucionSeleccionada: Ejecucion | null = null;
  evidencias: Evidencia[] = [];
  archivoEvidencia: File | null = null;
  subiendoArchivo = false;

  // Historial
  historial: Ejecucion[] = [];
  casoHistorialNombre = '';

  // Ambientes form
  ambienteForm: AmbienteRequest = { nombre: '', descripcion: '', urlServidor: '', estado: 'ACTIVO' };
  guardandoAmbiente = false;

  // Ciclos form
  cicloForm: CicloPruebaRequest = { proyectoId: 0, nombre: '', descripcion: '', estado: 'PLANIFICADO' };
  guardandoCiclo = false;

  readonly resultadosDisponibles = [
    { valor: 'APROBADO', etiqueta: 'Aprobado', icono: 'check_circle', clase: 'badge-aprobado' },
    { valor: 'FALLIDO', etiqueta: 'Fallido', icono: 'cancel', clase: 'badge-fallido' },
    { valor: 'BLOQUEADO', etiqueta: 'Bloqueado', icono: 'block', clase: 'badge-bloqueado' },
    { valor: 'EN_EJECUCION', etiqueta: 'En ejecución', icono: 'play_arrow', clase: 'badge-en-ejecucion' },
    { valor: 'PENDIENTE', etiqueta: 'Pendiente', icono: 'schedule', clase: 'badge-pendiente' },
    { valor: 'NO_APLICA', etiqueta: 'No aplica', icono: 'do_not_disturb_on', clase: 'badge-no-aplica' }
  ];

  constructor(
    private ejecucionService: EjecucionService,
    private casoService: CasoPruebaService,
    private proyectoService: ProyectoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarEjecuciones();
  }

  ngOnDestroy(): void {
    this.detenerCronometro();
  }

  cargarCatalogos(): void {
    this.proyectoService.listar().subscribe({
      next: (res: any) => (this.proyectos = res.content || []),
      error: () => {}
    });

    this.ejecucionService.listarAmbientes(false).subscribe({
      next: (res: any) => (this.ambientes = res || []),
      error: () => {}
    });

    this.casoService.listar({ page: 0, size: 200, estado: 'ACTIVO' }).subscribe({
      next: (res: any) => (this.casosPrueba = res.content || []),
      error: () => {}
    });
  }

  cargarCiclosDelProyecto(proyectoId: number): void {
    if (!proyectoId) {
      this.ciclos = [];
      return;
    }
    this.ejecucionService.listarCiclos(proyectoId).subscribe({
      next: (res: any) => (this.ciclos = res || []),
      error: () => {}
    });
  }

  cargarEjecuciones(): void {
    this.cargando = true;
    this.error = null;
    this.ejecucionService
      .listar({
        page: this.page,
        size: this.size,
        proyectoId: this.filtroProyecto || undefined,
        ambienteId: this.filtroAmbiente || undefined,
        cicloId: this.filtroCiclo || undefined,
        resultado: this.filtroResultado || undefined
      })
      .subscribe({
        next: (data: any) => {
          let lista = data.content || [];
          if (this.filtroBusqueda.trim()) {
            const b = this.filtroBusqueda.toLowerCase().trim();
            lista = lista.filter(
              (e: any) =>
                e.casoCodigo.toLowerCase().includes(b) ||
                e.casoNombre.toLowerCase().includes(b) ||
                (e.observaciones && e.observaciones.toLowerCase().includes(b))
            );
          }
          this.ejecuciones = lista;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
          this.cargando = false;
        },
        error: (err: any) => {
          this.error = 'No se pudieron cargar las ejecuciones.';
          this.cargando = false;
        }
      });
  }

  aplicarFiltros(): void {
    this.page = 0;
    this.cargarEjecuciones();
  }

  limpiarFiltros(): void {
    this.filtroProyecto = null;
    this.filtroAmbiente = null;
    this.filtroCiclo = null;
    this.filtroResultado = '';
    this.filtroBusqueda = '';
    this.page = 0;
    this.ciclos = [];
    this.cargarEjecuciones();
  }

  seleccionarProyectoFiltro(val: string): void {
    this.filtroProyecto = val ? Number(val) : null;
    this.filtroCiclo = null;
    if (this.filtroProyecto) {
      this.cargarCiclosDelProyecto(this.filtroProyecto);
    } else {
      this.ciclos = [];
    }
    this.aplicarFiltros();
  }

  // --- Opciones para app-select-search ---
  opcionesProyectos(): SelectOption[] {
    return this.proyectos.map((p: ProyectoResponse) => ({ value: String(p.id), label: `${p.codigo} - ${p.nombre}` }));
  }

  opcionesAmbientes(): SelectOption[] {
    return this.ambientes.map((a: AmbientePrueba) => ({ value: String(a.id), label: a.nombre }));
  }

  opcionesCiclos(): SelectOption[] {
    return this.ciclos.map((c: CicloPrueba) => ({ value: String(c.id), label: c.nombre }));
  }

  opcionesCasos(): SelectOption[] {
    return this.casosPrueba.map((c: CasoPrueba) => ({ value: String(c.id), label: `${c.codigo}: ${c.nombre}` }));
  }

  opcionesResultados(): SelectOption[] {
    return this.resultadosDisponibles.map((r: any) => ({ value: r.valor, label: r.etiqueta }));
  }

  toValue(val: number | null | undefined): string {
    return val ? String(val) : '';
  }

  // --- Cronómetro de Ejecución (RQ-MOD06-08) ---
  toggleCronometro(): void {
    if (this.cronometroActivo) {
      this.detenerCronometro();
    } else {
      this.iniciarCronometro();
    }
  }

  iniciarCronometro(): void {
    this.cronometroActivo = true;
    this.intervaloTimer = setInterval(() => {
      this.segundosTranscurridos++;
      this.formEjecutar.duracionSegundos = this.segundosTranscurridos;
    }, 1000);
  }

  detenerCronometro(): void {
    this.cronometroActivo = false;
    if (this.intervaloTimer) {
      clearInterval(this.intervaloTimer);
      this.intervaloTimer = null;
    }
  }

  resetearCronometro(): void {
    this.detenerCronometro();
    this.segundosTranscurridos = 0;
    this.formEjecutar.duracionSegundos = 0;
  }

  formatearDuracion(segundos?: number): string {
    if (!segundos || segundos <= 0) return '0s';
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // --- Modal Ejecución ---
  abrirModalEjecutar(ejecucion?: Ejecucion, casoIdPrefill?: number): void {
    this.error = null;
    this.resetearCronometro();

    if (ejecucion) {
      this.ejecucionEnEdicionId = ejecucion.id;
      this.formEjecutar = {
        casoId: ejecucion.casoId,
        ambienteId: ejecucion.ambienteId,
        cicloId: ejecucion.cicloId,
        resultado: ejecucion.resultado,
        duracionSegundos: ejecucion.duracionSegundos || 0,
        observaciones: ejecucion.observaciones || ''
      };
      this.segundosTranscurridos = ejecucion.duracionSegundos || 0;
    } else {
      this.ejecucionEnEdicionId = null;
      this.formEjecutar = {
        casoId: casoIdPrefill || (this.casosPrueba.length ? this.casosPrueba[0].id : 0),
        ambienteId: this.ambientes.length ? this.ambientes[0].id : null,
        cicloId: null,
        resultado: 'PENDIENTE',
        duracionSegundos: 0,
        observaciones: ''
      };
      this.iniciarCronometro();
    }
    this.mostrarModalEjecutar = true;
  }

  cerrarModalEjecutar(): void {
    this.detenerCronometro();
    this.mostrarModalEjecutar = false;
    this.ejecucionEnEdicionId = null;
  }

  seleccionarResultado(res: string): void {
    this.formEjecutar.resultado = res;
  }

  guardarEjecucion(): void {
    if (!this.formEjecutar.casoId) {
      this.error = 'Debes seleccionar un caso de prueba';
      return;
    }

    this.detenerCronometro();
    this.guardando = true;
    this.error = null;

    const op = this.ejecucionEnEdicionId
      ? this.ejecucionService.actualizar(this.ejecucionEnEdicionId, this.formEjecutar)
      : this.ejecucionService.registrar(this.formEjecutar);

    op.subscribe({
      next: () => {
        const edit = !!this.ejecucionEnEdicionId;
        this.guardando = false;
        this.cerrarModalEjecutar();
        this.cargarEjecuciones();
        this.toast.success(edit ? 'Ejecución actualizada' : 'Ejecución registrada', edit ? 'Los cambios se guardaron exitosamente.' : 'La ejecución se ha registrado exitosamente.');
      },
      error: (err: any) => {
        this.guardando = false;
        this.error = err.error?.message || 'Error al guardar la ejecución.';
      }
    });
  }

  // --- Modal Evidencias (RQ-MOD06-03, RQ-MOD06-04) ---
  abrirModalEvidencias(e: Ejecucion): void {
    this.ejecucionSeleccionada = e;
    this.evidencias = [];
    this.archivoEvidencia = null;
    this.mostrarModalEvidencias = true;
    this.cargarEvidencias(e.id);
  }

  cerrarModalEvidencias(): void {
    this.mostrarModalEvidencias = false;
    this.ejecucionSeleccionada = null;
    this.evidencias = [];
    this.archivoEvidencia = null;
  }

  cargarEvidencias(ejecucionId: number): void {
    this.ejecucionService.listarEvidencias(ejecucionId).subscribe({
      next: (list: any) => (this.evidencias = list || []),
      error: () => {}
    });
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
    if (!this.archivoEvidencia || !this.ejecucionSeleccionada) return;

    this.subiendoArchivo = true;
    this.ejecucionService.subirEvidencia(this.ejecucionSeleccionada.id, this.archivoEvidencia).subscribe({
      next: (nueva: any) => {
        this.evidencias.push(nueva);
        this.archivoEvidencia = null;
        this.subiendoArchivo = false;
        this.cargarEjecuciones();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Error al subir la evidencia');
        this.subiendoArchivo = false;
      }
    });
  }

  eliminarEvidencia(ev: Evidencia): void {
    if (!this.ejecucionSeleccionada) return;
    if (!confirm(`¿Eliminar la evidencia "${ev.nombre}"?`)) return;

    this.ejecucionService.eliminarEvidencia(this.ejecucionSeleccionada.id, ev.id).subscribe({
      next: () => {
        this.evidencias = this.evidencias.filter((x) => x.id !== ev.id);
        this.cargarEjecuciones();
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

  // --- Modal Historial (RQ-MOD06-07) ---
  abrirModalHistorial(e: Ejecucion): void {
    this.casoHistorialNombre = `${e.casoCodigo} - ${e.casoNombre}`;
    this.historial = [];
    this.mostrarModalHistorial = true;
    this.ejecucionService.historialPorCaso(e.casoId).subscribe({
      next: (list: any) => (this.historial = list || []),
      error: () => {}
    });
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.historial = [];
  }

  // --- Modal Ambientes (RQ-MOD06-05) ---
  abrirModalAmbientes(): void {
    this.ambienteForm = { nombre: '', descripcion: '', urlServidor: '', estado: 'ACTIVO' };
    this.mostrarModalAmbientes = true;
  }

  cerrarModalAmbientes(): void {
    this.mostrarModalAmbientes = false;
  }

  guardarAmbiente(): void {
    if (!this.ambienteForm.nombre.trim()) return;
    this.guardandoAmbiente = true;
    this.ejecucionService.crearAmbiente(this.ambienteForm).subscribe({
      next: (nuevo: any) => {
        this.ambientes.push(nuevo);
        this.ambienteForm = { nombre: '', descripcion: '', urlServidor: '', estado: 'ACTIVO' };
        this.guardandoAmbiente = false;
      },
      error: (err: any) => {
        alert(err.error?.message || 'Error al crear ambiente');
        this.guardandoAmbiente = false;
      }
    });
  }

  // --- Modal Ciclos (RQ-MOD06-06) ---
  abrirModalCiclos(): void {
    this.cicloForm = {
      proyectoId: this.proyectos.length ? this.proyectos[0].id : 0,
      nombre: '',
      descripcion: '',
      estado: 'PLANIFICADO'
    };
    this.mostrarModalCiclos = true;
  }

  cerrarModalCiclos(): void {
    this.mostrarModalCiclos = false;
  }

  guardarCiclo(): void {
    if (!this.cicloForm.nombre.trim() || !this.cicloForm.proyectoId) return;
    this.guardandoCiclo = true;
    this.ejecucionService.crearCiclo(this.cicloForm).subscribe({
      next: (nuevo: any) => {
        this.ciclos.push(nuevo);
        this.cicloForm = {
          proyectoId: this.cicloForm.proyectoId,
          nombre: '',
          descripcion: '',
          estado: 'PLANIFICADO'
        };
        this.guardandoCiclo = false;
      },
      error: (err: any) => {
        alert(err.error?.message || 'Error al crear ciclo');
        this.guardandoCiclo = false;
      }
    });
  }

  // --- Helper UI ---
  getBadgeInfo(resultado: string) {
    return (
      this.resultadosDisponibles.find((r: any) => r.valor === resultado) || {
        valor: resultado,
        etiqueta: resultado,
        icono: 'help_outline',
        clase: 'badge-pendiente'
      }
    );
  }

  cambiarPagina(nueva: number): void {
    if (nueva >= 0 && nueva < this.totalPages) {
      this.page = nueva;
      this.cargarEjecuciones();
    }
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}

