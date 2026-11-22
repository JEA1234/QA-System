import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';

import { ProyectoService } from '../../../core/services/proyecto.service';
import { ProyectoResponse } from '../../../core/models/proyecto.model';
import { FormProyectoComponent } from '../form-proyecto/form-proyecto.component';

@Component({
  selector: 'app-lista-proyectos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AgGridAngular, FormProyectoComponent],
  templateUrl: './lista-proyectos.component.html',
  styleUrls: ['./lista-proyectos.component.css']
})
export class ListaProyectosComponent implements OnInit {
  proyectos: ProyectoResponse[] = [];
  
  // Paginación y Filtros
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  
  filtroBusqueda = '';
  filtroCliente = '';
  filtroEstado = '';

  cargando = false;

  // Control del modal
  mostrarModalForm = false;
  proyectoSeleccionado: number | null = null;

  // AG-Grid
  private gridApi!: GridApi;
  public gridOptions: GridOptions = {
    rowHeight: 48,
    headerHeight: 40,
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    pagination: false // Usamos nuestra propia paginación
  };
  
  public overlayNoRowsTemplate = `<span class="ag-overlay-no-rows-center">No se encontraron proyectos</span>`;
  
  public defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    unSortIcon: true,
    suppressMovable: true,
  };

  public columnDefs: ColDef[] = [
    {
      headerName: 'Código',
      field: 'codigo',
      width: 160,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return `<span class="badge-code">${params.value}</span>`;
      }
    },
    {
      headerName: 'Proyecto & Alcance',
      field: 'nombre',
      flex: 1,
      minWidth: 300,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        return `
          <div class="user-cell">
            <div class="user-info">
              <span class="user-name">${params.data.nombre}</span>
              <span class="user-email">${params.data.descripcion || 'Sin descripción'}</span>
            </div>
          </div>
        `;
      }
    },
    {
      headerName: 'Cliente',
      field: 'cliente',
      width: 200,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return `<span>${params.value}</span>`;
      }
    },
    {
      headerName: 'Líder QA',
      field: 'liderQaNombre',
      width: 220,
      cellRenderer: (params: any) => {
        if (!params.value) return '<span style="color: var(--outline); font-style: italic;">Sin asignar</span>';
        return `<span>${params.value}</span>`;
      }
    },
    {
      headerName: 'Estado',
      field: 'estado',
      width: 140,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const estado = params.value;
        const colorClass = estado === 'ACTIVO' ? 'status-active' : (estado === 'CERRADO' ? 'status-inactive' : 'status-blocked');
        return `
          <div class="status-cell">
            <span class="status-badge ${colorClass}">
              <span class="status-dot"></span>
              ${estado.charAt(0) + estado.slice(1).toLowerCase()}
            </span>
          </div>
        `;
      }
    },
    {
      headerName: 'Acciones',
      width: 110,
      sortable: false,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        // Un botón para editar usando el onClick mapeado al host
        return `
          <div class="actions-cell">
            <button class="action-btn" data-action="edit" data-id="${params.data.id}" title="Editar proyecto">
              <span class="material-symbols-outlined">edit</span>
            </button>
          </div>
        `;
      }
    }
  ];

  constructor(private proyectoService: ProyectoService) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    // Interceptar clics en botones de la grilla (ya que innerHTML no bindea (click) de Angular)
    params.api.addEventListener('cellClicked', (event: any) => {
      if (event.event.target.closest('.action-btn')) {
        const action = event.event.target.closest('.action-btn').getAttribute('data-action');
        const id = event.event.target.closest('.action-btn').getAttribute('data-id');
        if (action === 'edit' && id) {
          this.abrirModalForm(+id);
        }
      }
    });
  }

  cargarProyectos(): void {
    this.cargando = true;
    if (this.gridApi) {
      this.gridApi.showLoadingOverlay();
    }
    this.proyectoService.listar(this.page, this.size, this.filtroBusqueda, this.filtroCliente, this.filtroEstado).subscribe({
      next: (res) => {
        this.proyectos = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.cargando = false;
        if (this.gridApi) {
          this.gridApi.hideOverlay();
          if (this.proyectos.length === 0) {
            this.gridApi.showNoRowsOverlay();
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar proyectos', err);
        this.cargando = false;
        if (this.gridApi) this.gridApi.hideOverlay();
      }
    });
  }

  onFiltroChange(): void {
    this.page = 0;
    this.cargarProyectos();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroCliente = '';
    this.filtroEstado = '';
    this.page = 0;
    this.cargarProyectos();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages) {
      this.page = nuevaPagina;
      this.cargarProyectos();
    }
  }

  cambiarTamano(event: any): void {
    this.size = +event.target.value;
    this.page = 0;
    this.cargarProyectos();
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getInitials(nombre: string): string {
    if (!nombre) return 'QA';
    const partes = nombre.trim().split(' ').filter(x => x);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  abrirModalForm(id?: number): void {
    this.proyectoSeleccionado = id || null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
    this.proyectoSeleccionado = null;
  }

  alGuardar(): void {
    this.cerrarModalForm();
    this.cargarProyectos();
  }
}