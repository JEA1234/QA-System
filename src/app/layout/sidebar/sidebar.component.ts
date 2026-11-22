import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../core/models/auth.model';

export interface ModuloItem {
  nombre: string;
  path: string;
  icono: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  usuario: LoginResponse | null = null;
  menuAbierto = false;
  colapsado = false;

  modulos: ModuloItem[] = [
    { nombre: 'Inicio', path: '/', icono: 'home' },
    { nombre: 'Usuarios', path: '/usuarios', icono: 'group', roles: ['ADMINISTRADOR', 'LIDER_QA'] },
    { nombre: 'Proyectos', path: '/proyectos', icono: 'folder_copy' },
    { nombre: 'Requerimientos', path: '/requerimientos', icono: 'list_alt' },
    { nombre: 'Trazabilidad', path: '/trazabilidad', icono: 'account_tree' },
    { nombre: 'Casos de Prueba', path: '/casos-prueba', icono: 'fact_check', roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER', 'DESARROLLADOR'] },
    { nombre: 'Ejecución', path: '/ejecucion', icono: 'play_circle', roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER'] },
    { nombre: 'Incidencias', path: '/incidencias', icono: 'bug_report' },
    { nombre: 'Corrección y Retest', path: '/retest', icono: 'published_with_changes', roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER', 'DESARROLLADOR'] },
    { nombre: 'Reportes', path: '/reportes', icono: 'bar_chart', roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER', 'CLIENTE'] },
    { nombre: 'Configuración', path: '/configuracion', icono: 'settings', roles: ['ADMINISTRADOR'] },
    { nombre: 'Auditoría', path: '/auditoria', icono: 'history', roles: ['ADMINISTRADOR', 'LIDER_QA'] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const estadoGuardado = localStorage.getItem('sidebar_colapsado');
    if (estadoGuardado !== null) {
      this.colapsado = estadoGuardado === 'true';
    }

    this.authService.user$.subscribe(u => {
      this.usuario = u;
    });
    if (!this.usuario) {
      this.usuario = this.authService.getCurrentUser();
    }
  }

  get modulosVisibles(): ModuloItem[] {
    const rolesUsuario = Array.from(this.usuario?.roles || []).map(r => r.replace('ROLE_', '').toUpperCase());

    // El Administrador tiene visibilidad absoluta de todos los módulos
    if (rolesUsuario.includes('ADMINISTRADOR')) {
      return this.modulos;
    }

    return this.modulos.filter(item => {
      // Si el módulo no requiere roles específicos, está disponible para todos
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return item.roles.some(rol => rolesUsuario.includes(rol.toUpperCase()));
    });
  }

  toggleColapso(): void {
    this.colapsado = !this.colapsado;
    localStorage.setItem('sidebar_colapsado', String(this.colapsado));
  }

  getNombreCompleto(): string {
    if (this.usuario?.nombres || this.usuario?.apellidos) {
      return `${this.usuario.nombres || ''} ${this.usuario.apellidos || ''}`.trim();
    }
    return 'Admin Sistema';
  }

  getCorreo(): string {
    return this.usuario?.correo || 'admin@qa.com';
  }

  getIniciales(): string {
    const n = (this.usuario?.nombres || 'Admin').trim();
    const a = (this.usuario?.apellidos || 'Sistema').trim();
    const ini1 = n.length > 0 ? n.charAt(0) : 'A';
    const ini2 = a.length > 0 ? a.charAt(0) : 'D';
    return (ini1 + ini2).toUpperCase();
  }

  getRolPrincipal(): string {
    if (this.usuario?.roles && this.usuario.roles.length > 0) {
      return this.usuario.roles[0].replace('ROLE_', '');
    }
    return 'ADMINISTRADOR';
  }

  toggleMenuUsuario(event: Event): void {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  irACambiarPassword(): void {
    this.menuAbierto = false;
    this.router.navigate(['/change-password']);
  }

  cerrarSesion(): void {
    this.menuAbierto = false;
    this.authService.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.menuAbierto = false;
  }
}
