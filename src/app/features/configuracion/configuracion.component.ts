import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { Configuracion, Catalogo, CatalogoRequest } from '../../core/models/configuracion.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  activeTab: 'GENERAL' | 'SLA' | 'CALIDAD' | 'SEGURIDAD' | 'CATALOGOS' = 'GENERAL';

  configuraciones: Configuracion[] = [];
  valoresEditados: Record<string, string> = {};

  cargando = false;
  guardando = false;
  mensajeExito: string | null = null;
  error: string | null = null;

  // Catálogos Dinámicos
  catalogoTipoSeleccionado = 'TIPO_PRUEBA';
  catalogos: Catalogo[] = [];
  cargandoCatalogos = false;
  mostrarModalCatalogo = false;
  editandoCatalogoId: number | null = null;

  catalogoForm: CatalogoRequest = {
    tipo: 'TIPO_PRUEBA',
    codigo: '',
    nombre: '',
    descripcion: '',
    orden: 0,
    activo: true
  };

  constructor(private configuracionService: ConfiguracionService) {}

  ngOnInit(): void {
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones(): void {
    this.cargando = true;
    this.error = null;
    this.configuracionService.listarConfiguraciones().subscribe({
      next: (res: Configuracion[]) => {
        this.cargando = false;
        this.configuraciones = res || [];
        this.valoresEditados = {};
        this.configuraciones.forEach(c => {
          this.valoresEditados[c.clave] = c.valor;
        });
      },
      error: (err: any) => {
        this.cargando = false;
        this.error = 'Error al cargar configuraciones: ' + (err?.error?.message || err.message);
      }
    });
  }

  cambiarTab(tab: 'GENERAL' | 'SLA' | 'CALIDAD' | 'SEGURIDAD' | 'CATALOGOS'): void {
    this.activeTab = tab;
    this.mensajeExito = null;
    this.error = null;
    if (tab === 'CATALOGOS') {
      this.cargarCatalogos();
    }
  }

  getConfiguracionesPorCategoria(cat: string): Configuracion[] {
    return this.configuraciones.filter(c => c.categoria === cat);
  }

  hayCambiosPendientes(): boolean {
    return this.configuraciones.some(c => this.valoresEditados[c.clave] !== c.valor);
  }

  guardarConfiguraciones(): void {
    const cambios: Record<string, string> = {};
    for (const c of this.configuraciones) {
      if (this.valoresEditados[c.clave] !== c.valor) {
        cambios[c.clave] = this.valoresEditados[c.clave];
      }
    }

    if (Object.keys(cambios).length === 0) return;

    this.guardando = true;
    this.error = null;
    this.mensajeExito = null;

    this.configuracionService.actualizarLote(cambios).subscribe({
      next: (res: Configuracion[]) => {
        this.guardando = false;
        this.configuraciones = res || [];
        this.valoresEditados = {};
        this.configuraciones.forEach(c => {
          this.valoresEditados[c.clave] = c.valor;
        });
        this.mensajeExito = '¡Parámetros de configuración actualizados correctamente!';
        setTimeout(() => (this.mensajeExito = null), 4000);
      },
      error: (err: any) => {
        this.guardando = false;
        this.error = 'Error al guardar configuración: ' + (err?.error?.message || err.message);
      }
    });
  }

  restablecerCambios(): void {
    this.configuraciones.forEach(c => {
      this.valoresEditados[c.clave] = c.valor;
    });
  }

  // --- Catálogos Dinámicos ---
  cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    this.configuracionService.listarCatalogos(this.catalogoTipoSeleccionado, false).subscribe({
      next: (res: Catalogo[]) => {
        this.cargandoCatalogos = false;
        this.catalogos = res || [];
      },
      error: (err: any) => {
        this.cargandoCatalogos = false;
        this.error = 'Error al cargar catálogo: ' + (err?.error?.message || err.message);
      }
    });
  }

  cambiarTipoCatalogo(tipo: string): void {
    this.catalogoTipoSeleccionado = tipo;
    this.cargarCatalogos();
  }

  abrirModalNuevoCatalogo(): void {
    this.editandoCatalogoId = null;
    this.catalogoForm = {
      tipo: this.catalogoTipoSeleccionado,
      codigo: '',
      nombre: '',
      descripcion: '',
      orden: this.catalogos.length + 1,
      activo: true
    };
    this.mostrarModalCatalogo = true;
  }

  abrirModalEditarCatalogo(c: Catalogo): void {
    this.editandoCatalogoId = c.id;
    this.catalogoForm = {
      tipo: c.tipo,
      codigo: c.codigo,
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      orden: c.orden,
      activo: c.activo
    };
    this.mostrarModalCatalogo = true;
  }

  cerrarModalCatalogo(): void {
    this.mostrarModalCatalogo = false;
    this.editandoCatalogoId = null;
  }

  guardarCatalogo(): void {
    if (!this.catalogoForm.codigo || !this.catalogoForm.nombre) {
      alert('Código y nombre son obligatorios.');
      return;
    }

    this.guardando = true;
    if (this.editandoCatalogoId) {
      this.configuracionService.actualizarCatalogo(this.editandoCatalogoId, this.catalogoForm).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModalCatalogo();
          this.cargarCatalogos();
          this.mensajeExito = 'Elemento de catálogo actualizado exitosamente.';
          setTimeout(() => (this.mensajeExito = null), 3000);
        },
        error: (err: any) => {
          this.guardando = false;
          alert('Error al actualizar: ' + (err?.error?.message || err.message));
        }
      });
    } else {
      this.configuracionService.crearCatalogo(this.catalogoForm).subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarModalCatalogo();
          this.cargarCatalogos();
          this.mensajeExito = 'Nuevo elemento agregado al catálogo.';
          setTimeout(() => (this.mensajeExito = null), 3000);
        },
        error: (err: any) => {
          this.guardando = false;
          alert('Error al crear: ' + (err?.error?.message || err.message));
        }
      });
    }
  }

  toggleEstadoCatalogo(c: Catalogo): void {
    const nuevoEstado = !c.activo;
    this.configuracionService.cambiarEstadoCatalogo(c.id, nuevoEstado).subscribe({
      next: () => {
        c.activo = nuevoEstado;
      },
      error: (err: any) => {
        alert('Error al cambiar estado: ' + (err?.error?.message || err.message));
      }
    });
  }
}

