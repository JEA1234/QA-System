import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UsuarioService, UsuarioListItem } from '../../../core/services/usuario.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, ICellRendererParams, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `<div class="user-cell">
    <div class="avatar" [class.avatar-inactive]="data?.estado === 'INACTIVO'">{{ initials }}</div>
    <div class="user-info">
      <span class="user-name">{{ data?.nombres }} {{ data?.apellidos }}</span>
      <span class="user-badge" *ngIf="data?.debeCambiarPassword"><span class="material-symbols-outlined">lock_reset</span>Debe cambiar clave</span>
    </div>
  </div>`,
  styles: [`.user-cell{display:flex;align-items:center;gap:8px;min-height:56px;padding:6px 0;box-sizing:border-box}.avatar{width:36px;height:36px;border-radius:50%;background:#dbe1ff;color:#003ea8;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}.avatar-inactive{background:#d3e4fe;color:#737686}.user-info{display:flex;flex-direction:column;gap:3px;min-width:0}.user-name{font-weight:600;line-height:18px;color:#0b1c30;overflow-wrap:anywhere}.user-badge{display:flex;align-items:center;gap:3px;width:max-content;max-width:100%;font-size:10px;line-height:14px;white-space:nowrap;color:#6b21a8}.user-badge .material-symbols-outlined{font-size:12px;flex-shrink:0}`]
})
export class UsuarioCellRenderer {
  data?: UsuarioListItem;
  get initials(): string { return `${this.data?.nombres?.charAt(0) || ''}${this.data?.apellidos?.charAt(0) || ''}`; }
  agInit(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; }
  refresh(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; return true; }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `<div class="roles-list"><span class="role-chip" *ngFor="let role of data?.roles">{{ role }}</span><span class="role-chip role-none" *ngIf="!data?.roles?.length">Sin rol</span></div>`,
  styles: [`.roles-list{display:flex;gap:4px;flex-wrap:wrap;align-content:center;align-items:center;min-height:56px;padding:8px 0;box-sizing:border-box}.role-chip{font-size:11px;font-weight:600;padding:3px 9px;line-height:16px;border-radius:20px;background:#dbe1ff;color:#003ea8;text-transform:uppercase;white-space:nowrap}.role-none{background:#d3e4fe;color:#737686}`]
})
export class RolesCellRenderer {
  data?: UsuarioListItem;
  agInit(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; }
  refresh(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; return true; }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `<div class="estado-col"><span class="badge" [class.badge-active]="data?.estado === 'ACTIVO'" [class.badge-inactive]="data?.estado !== 'ACTIVO'">{{ data?.estado }}</span><span class="badge badge-locked" *ngIf="data?.cuentaBloqueada">Bloqueada</span></div>`,
  styles: [`.estado-col{display:flex;flex-direction:column;align-items:flex-start;gap:4px;justify-content:center;min-height:56px;padding:6px 0;box-sizing:border-box}.badge{font-size:11px;font-weight:700;line-height:16px;padding:3px 10px;border-radius:20px;width:max-content;white-space:nowrap}.badge-active{background:#dcfce7;color:#166534}.badge-inactive{background:#d3e4fe;color:#737686}.badge-locked{background:#fef3c7;color:#92400e}`]
})
export class EstadoCellRenderer {
  data?: UsuarioListItem;
  agInit(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; }
  refresh(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; return true; }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `<div class="actions-row"><button class="action-btn" title="Editar usuario" (click)="parent.abrirEditar(data!)"><span class="material-symbols-outlined">edit</span></button><button class="action-btn" [title]="data?.estado === 'ACTIVO' ? 'Desactivar usuario' : 'Activar usuario'" (click)="parent.toggleEstado(data!)"><span class="material-symbols-outlined">{{ data?.estado === 'ACTIVO' ? 'person_off' : 'how_to_reg' }}</span></button><button *ngIf="data?.cuentaBloqueada" class="action-btn" title="Desbloquear cuenta" (click)="parent.desbloquear(data!)"><span class="material-symbols-outlined">lock_open</span></button></div>`,
  styles: [`.actions-row{display:flex;align-items:center;justify-content:center;gap:4px;height:100%}.action-btn{width:32px;height:32px;border:1px solid transparent;border-radius:6px;background:transparent;color:#737686;cursor:pointer;display:flex;align-items:center;justify-content:center}.action-btn:hover{background:#eff4ff;color:#2563eb;border-color:#e2e8f0}.material-symbols-outlined{font-size:18px}`]
})
export class AccionesCellRenderer {
  data?: UsuarioListItem;
  parent!: ListaUsuariosComponent;
  agInit(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; this.parent = params.context.componentParent; }
  refresh(params: ICellRendererParams<UsuarioListItem>) { this.data = params.data; return true; }
}

interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface UsuarioForm {
  nombres: string;
  apellidos: string;
  correo: string;
  password: string;
  estado: 'ACTIVO' | 'INACTIVO';
  debeCambiarPassword: boolean;
  rolesIds: number[];
}

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular, UsuarioCellRenderer, RolesCellRenderer, EstadoCellRenderer, AccionesCellRenderer],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.css'
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: UsuarioListItem[] = [];
  loading = false;
  private gridApi: any;

  // Filtros
  busqueda = '';
  filtroEstado = '';
  searchTimer: any;

  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  columnDefs: ColDef<UsuarioListItem>[] = [
    { headerName: 'Usuario', cellRenderer: UsuarioCellRenderer, minWidth: 250, flex: 1.5, autoHeight: true },
    { field: 'correo', headerName: 'Correo', minWidth: 210 },
    { headerName: 'Roles', cellRenderer: RolesCellRenderer, minWidth: 190, flex: 1.1, autoHeight: true },
    { headerName: 'Estado', cellRenderer: EstadoCellRenderer, minWidth: 145, autoHeight: true },
    { field: 'ultimoAcceso', headerName: 'Último acceso', minWidth: 170, valueFormatter: p => p.value ? new Date(p.value).toLocaleString('es-PE') : '— nunca —' },
    { headerName: 'Acciones', cellRenderer: AccionesCellRenderer, minWidth: 130, maxWidth: 150, sortable: false, resizable: false }
  ];
  defaultColDef: ColDef = { sortable: true, resizable: true, flex: 1, minWidth: 120 };
  overlayNoRowsTemplate = '<span class="grid-empty">No se encontraron usuarios</span>';
  gridOptions: GridOptions<UsuarioListItem> = {
    rowHeight: 56,
    headerHeight: 48,
    context: { componentParent: this }
  };

  get tableHeight(): string {
    const visibleRows = this.usuarios.length || Math.min(this.size, Math.max(this.totalElements, 1));
    return `${Math.min(600, Math.max(250, 48 + visibleRows * 56 + 20))}px`;
  }

  get paginaInfo(): string {
    if (!this.totalElements) return '0 de 0';
    const desde = this.page * this.size + 1;
    const hasta = Math.min((this.page + 1) * this.size, this.totalElements);
    return `${desde}-${hasta} de ${this.totalElements}`;
  }

  get pages(): (number | string)[] {
    if (this.totalPages <= 7) return Array.from({ length: this.totalPages }, (_, i) => i);
    const candidates = [...new Set([0, this.page - 1, this.page, this.page + 1, this.totalPages - 1])]
      .filter(p => p >= 0 && p < this.totalPages).sort((a, b) => a - b);
    const result: (number | string)[] = [];
    candidates.forEach((p, i) => {
      if (i > 0 && p - candidates[i - 1] > 1) result.push('...');
      result.push(p);
    });
    return result;
  }

  // Modal confirmacion (activar/desactivar/desbloquear)
  modalConfirmVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalAccion: (() => void) | null = null;

  // Modal formulario
  modalFormVisible = false;
  modoEdicion = false;
  usuarioEditandoId: number | null = null;
  loadingForm = false;
  showPassword = false;
  roles: Rol[] = [];

  form: UsuarioForm = {
    nombres: '',
    apellidos: '',
    correo: '',
    password: '',
    estado: 'ACTIVO',
    debeCambiarPassword: true,
    rolesIds: []
  };

  constructor(
    private svc: UsuarioService,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargar();
    this.cargarRoles();
  }

  onGridReady(event: any) {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
  }

  onGridSizeChanged(event: any) {
    event.api.sizeColumnsToFit();
  }

  // ---- Lista ----
  cargar() {
    this.loading = true;
    this.svc.listar({ page: this.page, size: this.size, busqueda: this.busqueda || undefined, estado: this.filtroEstado || undefined }).subscribe({
      next: (res) => {
        this.usuarios = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
        if (this.page >= this.totalPages && this.totalPages > 0) {
          this.page = this.totalPages - 1;
          this.cargar();
        }
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 0; this.cargar(); }, 400);
  }

  onFiltroEstado() { this.page = 0; this.cargar(); }
  cambiarPagina(page: number | string) {
    if (typeof page === 'number' && page !== this.page) { this.page = page; this.cargar(); }
  }
  pageLabel(page: number | string): number | string { return typeof page === 'number' ? page + 1 : '…'; }
  cambiarTamano(event: Event) {
    this.size = Number((event.target as HTMLSelectElement).value);
    this.page = 0;
    this.cargar();
  }
  prevPage() { if (this.page > 0) { this.page--; this.cargar(); } }
  nextPage() { if (this.page < this.totalPages - 1) { this.page++; this.cargar(); } }

  // ---- Modal confirmacion ----
  confirmarAccion(titulo: string, mensaje: string, accion: () => void) {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalAccion = accion;
    this.modalConfirmVisible = true;
  }

  ejecutarAccion() {
    if (this.modalAccion) this.modalAccion();
    this.modalConfirmVisible = false;
  }

  toggleEstado(u: UsuarioListItem) {
    const nuevoEstado = u.estado === 'ACTIVO' ? 'desactivar' : 'activar';
    this.confirmarAccion(
      `${nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1)} usuario`,
      `Confirmas que deseas ${nuevoEstado} a ${u.nombres} ${u.apellidos}?`,
      () => {
        this.svc.toggleEstado(u.id).subscribe({
          next: () => {
            this.toastService.success(
              'Estado actualizado',
              `Usuario ${u.nombres} ${u.apellidos} ha sido ${nuevoEstado === 'activar' ? 'activado' : 'desactivado'}.`
            );
            this.cargar();
          },
          error: (err) => {
            this.toastService.error('Error al cambiar estado', err.error?.error || 'No se pudo actualizar el estado.');
          }
        });
      }
    );
  }

  desbloquear(u: UsuarioListItem) {
    this.confirmarAccion(
      'Desbloquear cuenta',
      `Confirmas que deseas desbloquear la cuenta de ${u.nombres} ${u.apellidos}?`,
      () => {
        this.svc.desbloquear(u.id).subscribe({
          next: () => {
            this.toastService.success(
              'Cuenta desbloqueada',
              `La cuenta de ${u.nombres} ${u.apellidos} ha sido desbloqueada exitosamente.`
            );
            this.cargar();
          },
          error: (err) => {
            this.toastService.error('Error al desbloquear', err.error?.error || 'No se pudo desbloquear la cuenta.');
          }
        });
      }
    );
  }

  // ---- Modal formulario ----
  private readonly rolesPorDefecto: Rol[] = [
    { id: 1, nombre: 'ADMINISTRADOR', descripcion: 'Usuarios, roles, permisos, catálogos y configuración' },
    { id: 2, nombre: 'LIDER_QA', descripcion: 'Proyectos, requerimientos, casos, asignaciones, incidencias y métricas' },
    { id: 3, nombre: 'ANALISTA_TESTER', descripcion: 'Diseño y ejecución de pruebas, evidencias y registro de incidencias' },
    { id: 4, nombre: 'DESARROLLADOR', descripcion: 'Consulta, corrección y actualización de incidencias asignadas' },
    { id: 5, nombre: 'CLIENTE', descripcion: 'Consulta autorizada de estado, incidencias y reportes' }
  ];

  cargarRoles() {
    this.http.get<Rol[]>(`${environment.apiUrl}/roles`).subscribe({
      next: (res) => {
        this.roles = (res && res.length > 0) ? res : this.rolesPorDefecto;
      },
      error: () => {
        this.roles = this.rolesPorDefecto;
      }
    });
  }

  resetForm() {
    this.form = {
      nombres: '',
      apellidos: '',
      correo: '',
      password: '',
      estado: 'ACTIVO',
      debeCambiarPassword: true,
      rolesIds: []
    };
    this.showPassword = false;
  }

  abrirNuevo() {
    this.modoEdicion = false;
    this.usuarioEditandoId = null;
    this.resetForm();
    if (this.roles.length === 0) {
      this.cargarRoles();
    }
    this.modalFormVisible = true;
  }

  abrirEditar(u: UsuarioListItem) {
    if (this.roles.length === 0) {
      this.cargarRoles();
    }
    this.modoEdicion = true;
    this.usuarioEditandoId = u.id;
    this.loadingForm = true;
    this.modalFormVisible = true;

    this.http.get<any>(`${environment.apiUrl}/usuarios/${u.id}`).subscribe({
      next: (data) => {
        this.form = {
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo,
          password: '',
          estado: data.estado,
          debeCambiarPassword: data.debeCambiarPassword,
          rolesIds: (data.roles || []).map((r: any) => {
            if (typeof r === 'number') return r;
            if (typeof r === 'object' && r && r.id) return r.id;
            const rolMatch = this.roles.find(rol => rol.nombre === r);
            return rolMatch ? rolMatch.id : null;
          }).filter((id: any) => id !== null)
        };
        this.loadingForm = false;
      },
      error: () => { this.loadingForm = false; }
    });
  }

  cerrarModal() {
    this.modalFormVisible = false;
  }

  toggleRol(rolId: number) {
    const idx = this.form.rolesIds.indexOf(rolId);
    if (idx >= 0) { this.form.rolesIds.splice(idx, 1); }
    else { this.form.rolesIds.push(rolId); }
  }

  tieneRol(rolId: number): boolean {
    return this.form.rolesIds.includes(rolId);
  }

  togglePassword() { this.showPassword = !this.showPassword; }

  guardar() {
    if (this.loading) return;
    this.loading = true;

    const payload: any = {
      ...this.form,
      rolesIds: (this.form.rolesIds || []).map(r => {
        if (typeof r === 'number') return r;
        const rolMatch = this.roles.find(rol => rol.nombre === r);
        return rolMatch ? rolMatch.id : Number(r);
      }).filter(id => !isNaN(id))
    };

    if (this.modoEdicion && !payload.password) {
      delete payload.password;
    }

    const req = this.modoEdicion
      ? this.http.put(`${environment.apiUrl}/usuarios/${this.usuarioEditandoId}`, payload)
      : this.http.post(`${environment.apiUrl}/usuarios`, payload);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.modalFormVisible = false;
        this.toastService.success(
          this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado exitosamente',
          this.modoEdicion
            ? 'Los cambios fueron guardados con éxito.'
            : `${this.form.nombres} ${this.form.apellidos} ha sido registrado.`
        );
        this.cargar();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(
          'Error al guardar',
          err.error?.error || 'No se pudo guardar el usuario. Verifique los datos ingresados.'
        );
      }
    });
  }
}
