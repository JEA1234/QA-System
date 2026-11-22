import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BusquedaNotificacionesService } from '../../core/services/busqueda-notificaciones.service';
import { BusquedaItem, BusquedaGlobalResponse, Notificacion } from '../../core/models/busqueda-notificaciones.model';
import { PageResponse } from '../../core/services/usuario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  queryBusqueda = '';
  resultados: BusquedaItem[] = [];
  buscando = false;
  mostrarResultados = false;

  notificaciones: Notificacion[] = [];
  mostrarNotificaciones = false;
  cargandoNotificaciones = false;
  conteoNoLeidas = 0;

  private debounceTimer: any = null;

  constructor(
    private busquedaService: BusquedaNotificacionesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.busquedaService.noLeidas$.subscribe(count => {
      this.conteoNoLeidas = count;
    });
    this.busquedaService.actualizarConteoNoLeidas().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  onInputBusqueda(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (this.queryBusqueda.trim().length < 2) {
      this.resultados = [];
      this.mostrarResultados = false;
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.ejecutarBusqueda();
    }, 250);
  }

  ejecutarBusqueda(): void {
    const q = this.queryBusqueda.trim();
    if (q.length < 2) return;

    this.buscando = true;
    this.mostrarResultados = true;

    this.busquedaService.busquedaGlobal(q).subscribe({
      next: (res: BusquedaGlobalResponse) => {
        this.buscando = false;
        this.resultados = res?.items || [];
      },
      error: () => {
        this.buscando = false;
        this.resultados = [];
      }
    });
  }

  seleccionarResultado(item: BusquedaItem): void {
    this.mostrarResultados = false;
    this.queryBusqueda = '';
    this.router.navigate([item.enlace]);
  }

  limpiarBusqueda(): void {
    this.queryBusqueda = '';
    this.resultados = [];
    this.mostrarResultados = false;
  }

  toggleNotificaciones(event: Event): void {
    event.stopPropagation();
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    this.mostrarResultados = false;

    if (this.mostrarNotificaciones) {
      this.cargarNotificaciones();
    }
  }

  cargarNotificaciones(): void {
    this.cargandoNotificaciones = true;
    this.busquedaService.listarNotificaciones(0, 10).subscribe({
      next: (res: PageResponse<Notificacion>) => {
        this.cargandoNotificaciones = false;
        this.notificaciones = res?.content || [];
      },
      error: () => {
        this.cargandoNotificaciones = false;
      }
    });
  }

  clickNotificacion(n: Notificacion): void {
    if (!n.leida) {
      this.busquedaService.marcarLeida(n.id).subscribe();
      n.leida = true;
    }
    this.mostrarNotificaciones = false;
    if (n.enlace) {
      this.router.navigate([n.enlace]);
    }
  }

  marcarTodasLeidas(): void {
    this.busquedaService.marcarTodasLeidas().subscribe({
      next: () => {
        this.notificaciones.forEach(n => (n.leida = true));
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.mostrarResultados = false;
    this.mostrarNotificaciones = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.mostrarResultados = false;
    this.mostrarNotificaciones = false;
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'PROYECTO': return 'folder_special';
      case 'REQUERIMIENTO': return 'assignment';
      case 'CASOS_PRUEBA':
      case 'CASO_PRUEBA': return 'fact_check';
      case 'INCIDENCIA': return 'bug_report';
      default: return 'search';
    }
  }

  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'PROYECTO': return 'badge-proy';
      case 'REQUERIMIENTO': return 'badge-req';
      case 'CASOS_PRUEBA':
      case 'CASO_PRUEBA': return 'badge-caso';
      case 'INCIDENCIA': return 'badge-inc';
      default: return 'badge-def';
    }
  }

  getNotifIcon(tipo: string): string {
    switch (tipo) {
      case 'ALERTA': return 'warning';
      case 'RETEST_PENDIENTE': return 'published_with_changes';
      case 'SLA_VENCIDO': return 'alarm';
      case 'ASIGNACION': return 'assignment_ind';
      default: return 'notifications';
    }
  }

  getNotifColorClass(tipo: string): string {
    switch (tipo) {
      case 'ALERTA': return 'text-orange bg-orange-soft';
      case 'RETEST_PENDIENTE': return 'text-purple bg-purple-soft';
      case 'SLA_VENCIDO': return 'text-danger bg-danger-soft';
      case 'ASIGNACION': return 'text-primary bg-primary-soft';
      default: return 'text-primary bg-blue-soft';
    }
  }
}

