import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReportesService } from '../../../core/services/reportes.service';
import { LoginResponse } from '../../../core/models/auth.model';
import { DashboardReportes } from '../../../core/models/reportes.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  readonly Math = Math;

  usuario: LoginResponse | null = null;
  cargando: boolean = true;

  // Métricas reales del Sistema
  cobertura: number = 0;
  casosEjecutados: number = 0;
  casosTotales: number = 0;
  passRate: number = 0;
  bugsAbiertos: number = 0;
  bugsBloqueantes: number = 0;

  // Distribución de severidad de bugs
  pctCritica: number = 0;
  pctMayor: number = 0;
  pctMenor: number = 0;

  constructor(
    private authService: AuthService,
    private reportesService: ReportesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.usuario = user;
    });

    if (!this.usuario) {
      this.usuario = this.authService.getCurrentUser();
    }

    this.cargarMetricasReales();
  }

  cargarMetricasReales(): void {
    this.cargando = true;
    this.reportesService.obtenerDashboard().subscribe({
      next: (res: DashboardReportes) => {
        if (res && res.kpis) {
          this.cobertura = res.kpis.coberturaReqPct || 0;
          this.casosEjecutados = res.kpis.totalEjecuciones || 0;
          this.casosTotales = res.kpis.totalCasosPrueba ?? res.kpis.totalEjecuciones ?? 0;
          this.passRate = res.kpis.passRatePct || 0;
          this.bugsAbiertos = res.kpis.defectosAbiertos || 0;
          this.bugsBloqueantes = res.kpis.defectosCriticos || 0;
        }

        if (res && res.distribucionIncidencias) {
          this.pctCritica = res.distribucionIncidencias.pctCritica || 0;
          this.pctMayor = res.distribucionIncidencias.pctMayor || 0;
          this.pctMenor = res.distribucionIncidencias.pctMenor || 0;
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar métricas reales del dashboard:', err);
        this.cargando = false;
      }
    });
  }

  getNombre(): string {
    if (this.usuario?.nombres) {
      return this.usuario.nombres.split(' ')[0];
    }
    return 'Usuario';
  }

  getRol(): string {
    if (this.usuario?.roles && this.usuario.roles.length > 0) {
      return this.usuario.roles[0].replace('ROLE_', '').replace('_', ' ');
    }
    return 'QA Lead';
  }

  navegar(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
