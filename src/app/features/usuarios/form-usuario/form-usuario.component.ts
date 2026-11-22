import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface UsuarioForm {
  nombres: string;
  apellidos: string;
  correo: string;
  password?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  debeCambiarPassword: boolean;
  rolesIds: number[];
}

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.css'
})
export class FormUsuarioComponent implements OnInit {
  modoEdicion = false;
  usuarioId: number | null = null;
  loading = false;
  loadingDatos = false;
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
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarRoles();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.modoEdicion = true;
      this.usuarioId = Number(id);
      this.cargarUsuario(this.usuarioId);
    }
  }

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

  cargarUsuario(id: number) {
    this.loadingDatos = true;
    this.http.get<any>(`${environment.apiUrl}/usuarios/${id}`).subscribe({
      next: (u) => {
        this.form = {
          nombres: u.nombres,
          apellidos: u.apellidos,
          correo: u.correo,
          password: '',
          estado: u.estado,
          debeCambiarPassword: u.debeCambiarPassword,
          rolesIds: (u.roles || []).map((r: any) => {
            if (typeof r === 'number') return r;
            if (typeof r === 'object' && r && r.id) return r.id;
            const rolMatch = this.roles.find(rol => rol.nombre === r);
            return rolMatch ? rolMatch.id : null;
          }).filter((rolId: any) => rolId !== null)
        };
        this.loadingDatos = false;
      },
      error: () => { this.loadingDatos = false; }
    });
  }

  toggleRol(rolId: number) {
    const idx = this.form.rolesIds.indexOf(rolId);
    if (idx >= 0) {
      this.form.rolesIds.splice(idx, 1);
    } else {
      this.form.rolesIds.push(rolId);
    }
  }

  tieneRol(rolId: number): boolean {
    return this.form.rolesIds.includes(rolId);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
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
      ? this.http.put(`${environment.apiUrl}/usuarios/${this.usuarioId}`, payload)
      : this.http.post(`${environment.apiUrl}/usuarios`, payload);

    req.subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success(
          this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado exitosamente',
          this.modoEdicion
            ? 'Los cambios fueron guardados con éxito.'
            : `${this.form.nombres} ${this.form.apellidos} ha sido registrado.`
        );
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(
          'Error al guardar',
          err.error?.error || 'No se pudo guardar el usuario. Verifique los datos.'
        );
      }
    });
  }
}