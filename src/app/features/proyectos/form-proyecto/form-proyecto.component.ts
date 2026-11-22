import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { ProyectoRequest, ProyectoResponse } from '../../../core/models/proyecto.model';
import { UsuarioService, UsuarioListItem } from '../../../core/services/usuario.service';
import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { SelectSearchComponent, SelectOption } from '../../../shared/components/select-search/select-search.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-form-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent, SelectSearchComponent],
  templateUrl: './form-proyecto.component.html',
  styleUrls: ['./form-proyecto.component.css']
})
export class FormProyectoComponent implements OnInit {
  @Input() proyectoId: number | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onGuardado = new EventEmitter<void>();

  isEdit = false;
  error = '';
  usuarios: UsuarioListItem[] = [];
  fechaError = '';
  
  // Modelo para el formulario
  proyecto: ProyectoRequest = {
    codigo: '',
    nombre: '',
    descripcion: '',
    cliente: 'banco',
    liderQaId: null,
    fechaInicio: '',
    fechaFin: '',
    estado: 'ACTIVO',
    equipoIds: []
  };

  testersDisponibles: { id: number; nombres: string; rol: string; iniciales: string; activo: boolean }[] = [];

  constructor(
    private proyectoService: ProyectoService,
    private usuarioService: UsuarioService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    if (this.proyectoId) {
      this.isEdit = true;
      this.cargarProyecto(this.proyectoId);
    } else {
      // Valores por defecto para nuevo proyecto
      const hoy = new Date();
      this.proyecto.fechaInicio = hoy.toISOString().substring(0, 10);
      
      const fin = new Date();
      fin.setMonth(fin.getMonth() + 3);
      this.proyecto.fechaFin = fin.toISOString().substring(0, 10);
      
      this.generarCodigoMock();
    }
  }

  cargarUsuarios(): void {
    this.usuarioService.listar({ page: 0, size: 1000, estado: 'ACTIVO' }).subscribe({
      next: (res) => {
        if (res.content?.length) {
          this.usuarios = res.content;

          // Si no está editando y no hay líder seleccionado aún, preseleccionar el primer LIDER_QA disponible
          if (!this.isEdit && !this.proyecto.liderQaId) {
            const liderDefecto = res.content.find(u => u.roles?.some(r => /LIDER_QA/i.test(r)));
            if (liderDefecto) {
              this.proyecto.liderQaId = liderDefecto.id;
            }
          }

          const testers = res.content.filter(u => u.roles?.some(rol => /TESTER|QA|ANALISTA/i.test(rol)));
          this.testersDisponibles = testers.map(u => ({
            id: u.id,
            nombres: `${u.nombres} ${u.apellidos}`,
            rol: u.roles?.[0]?.replace('ROLE_', '') || 'Equipo QA',
            iniciales: this.getInitials(`${u.nombres} ${u.apellidos}`),
            activo: this.proyecto.equipoIds.includes(u.id)
          }));
        }
      },
      error: (err) => {
        console.error('Error al cargar lista de usuarios', err);
      }
    });
  }

  cargarProyecto(id: number): void {
    this.proyectoService.buscarPorId(id).subscribe({
      next: (res) => {
        this.proyecto.codigo = res.codigo;
        this.proyecto.nombre = res.nombre;
        this.proyecto.descripcion = res.descripcion;
        this.proyecto.cliente = res.cliente;
        this.proyecto.liderQaId = res.liderQaId;
        this.proyecto.fechaInicio = res.fechaInicio;
        this.proyecto.fechaFin = res.fechaFin;
        this.proyecto.estado = res.estado;
        this.proyecto.equipoIds = res.equipo ? res.equipo.map(e => e.id) : [];
        
        // Actualizar visualmente los testers
        this.testersDisponibles.forEach(t => {
          t.activo = this.proyecto.equipoIds.includes(t.id);
        });
      },
      error: (err) => {
        const msg = err.error?.error || err.error?.message || 'Error al cargar los datos del proyecto';
        this.toastService.error('Error', msg);
      }
    });
  }

  guardar(): void {
    if (!this.validarFechas()) return;

    const payload: ProyectoRequest = {
      codigo: this.proyecto.codigo?.trim(),
      nombre: this.proyecto.nombre?.trim(),
      descripcion: this.proyecto.descripcion?.trim() || '',
      cliente: this.proyecto.cliente?.trim() || 'banco',
      liderQaId: this.proyecto.liderQaId ? Number(this.proyecto.liderQaId) : null,
      fechaInicio: this.proyecto.fechaInicio ? this.proyecto.fechaInicio : null,
      fechaFin: this.proyecto.fechaFin ? this.proyecto.fechaFin : null,
      estado: this.proyecto.estado || 'ACTIVO',
      equipoIds: this.proyecto.equipoIds || []
    };

    if (this.isEdit && this.proyectoId) {
      this.proyectoService.editar(this.proyectoId, payload).subscribe({
        next: () => {
          this.toastService.success('Proyecto actualizado', 'Los cambios se guardaron exitosamente.');
          this.onGuardado.emit();
        },
        error: (err) => this.manejarError(err, 'Error al actualizar proyecto')
      });
    } else {
      this.proyectoService.crear(payload).subscribe({
        next: () => {
          this.toastService.success('Proyecto creado', 'El proyecto se ha registrado exitosamente.');
          this.onGuardado.emit();
        },
        error: (err) => this.manejarError(err, 'Error al crear proyecto')
      });
    }
  }

  private manejarError(err: any, fallbackTitle: string): void {
    let mensaje = 'Revisa los datos ingresados';
    if (err.error?.error) {
      mensaje = err.error.error;
    } else if (err.error?.errores) {
      mensaje = Object.values(err.error.errores).join('; ');
    } else if (err.error?.message) {
      mensaje = err.error.message;
    } else if (err.message) {
      mensaje = err.message;
    }
    this.toastService.error(fallbackTitle, mensaje);
  }

  validarFechas(): boolean {
    this.fechaError = '';
    if (this.proyecto.fechaInicio && this.proyecto.fechaFin && this.proyecto.fechaFin < this.proyecto.fechaInicio) {
      this.fechaError = 'La fecha fin no puede ser anterior a la fecha de inicio.';
      return false;
    }
    return true;
  }

  cerrar(): void {
    this.onClose.emit();
  }

  toggleTester(tester: { id: number; activo: boolean }): void {
    tester.activo = !tester.activo;
    const index = this.proyecto.equipoIds.indexOf(tester.id);
    if (tester.activo && index === -1) {
      this.proyecto.equipoIds.push(tester.id);
    } else if (!tester.activo && index > -1) {
      this.proyecto.equipoIds.splice(index, 1);
    }
  }

  getInicialesProyecto(): string {
    if (!this.proyecto.nombre) return 'QA';
    const partes = this.proyecto.nombre.trim().split(' ').filter(x => x);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return this.proyecto.nombre.substring(0, 2).toUpperCase();
  }

  generarCodigoMock(): void {
    const rdn = Math.floor(Math.random() * 90) + 10;
    this.proyecto.codigo = 'PRJ-2025-' + rdn;
  }

  opcionesClientes(): SelectOption[] { 
    return [
      { value: 'banco', label: 'Banco Continental' }, 
      { value: 'rimac', label: 'Rímac Seguros' }, 
      { value: 'retail', label: 'Retail Corp S.A.' }, 
      { value: 'telecom', label: 'Telecom Global' }
    ]; 
  }

  opcionesLideres(): SelectOption[] { 
    const lideres = this.usuarios.filter(u => u.roles?.some(rol => /LIDER_QA|ADMINISTRADOR/i.test(rol)));
    const lista = lideres.length > 0 ? lideres : this.usuarios;
    return lista.map(u => ({ value: String(u.id), label: `${u.nombres} ${u.apellidos}` })); 
  }

  seleccionarLider(value: string): void { 
    this.proyecto.liderQaId = value ? Number(value) : null; 
  }

  seleccionarCliente(value: string): void { 
    this.proyecto.cliente = value; 
  }

  toValue(value: number | null | undefined): string { 
    return (value !== null && value !== undefined) ? String(value) : ''; 
  }

  getInitials(nombre: string): string { 
    const p = nombre.trim().split(/\s+/).filter(Boolean); 
    return p.length > 1 ? (p[0][0] + p[1][0]).toUpperCase() : nombre.substring(0, 2).toUpperCase(); 
  }
}
