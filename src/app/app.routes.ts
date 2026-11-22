import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './features/auth/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { ListaUsuariosComponent } from './features/usuarios/lista-usuarios/lista-usuarios.component';
import { ListaProyectosComponent } from './features/proyectos/lista-proyectos/lista-proyectos.component';
import { FormProyectoComponent } from './features/proyectos/form-proyecto/form-proyecto.component';
import { ListaRequerimientosComponent } from './features/requerimientos/lista-requerimientos/lista-requerimientos.component';
import { ListaCasosPruebaComponent } from './features/casos-prueba/lista-casos-prueba/lista-casos-prueba.component';
import { ListaEjecucionesComponent } from './features/ejecucion/lista-ejecuciones.component';
import { ListaIncidenciasComponent } from './features/incidencias/lista-incidencias.component';
import { CorreccionRetestComponent } from './features/correccionretest/correccion-retest.component';
import { MatrizTrazabilidadComponent } from './features/trazabilidad/matriz-trazabilidad.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { ConfiguracionComponent } from './features/configuracion/configuracion.component';
import { ListaAuditoriaComponent } from './features/auditoria/lista-auditoria.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * Rutas de la aplicacion con control de acceso por rol (RBAC).
 * - /login, /forgot-password, /reset-password: publicos
 * - Rutas hijas dentro de Layout: protegidas por authGuard y roleGuard segun matriz SRS
 */
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      {
        path: 'usuarios',
        component: ListaUsuariosComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA'] }
      },
      { path: 'proyectos', component: ListaProyectosComponent },
      {
        path: 'proyectos/nuevo',
        component: FormProyectoComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA'] }
      },
      {
        path: 'proyectos/:id/editar',
        component: FormProyectoComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA'] }
      },
      { path: 'requerimientos', component: ListaRequerimientosComponent },
      { path: 'trazabilidad', component: MatrizTrazabilidadComponent },
      {
        path: 'casos-prueba',
        component: ListaCasosPruebaComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER', 'DESARROLLADOR'] }
      },
      {
        path: 'ejecucion',
        component: ListaEjecucionesComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER'] }
      },
      { path: 'incidencias', component: ListaIncidenciasComponent },
      {
        path: 'retest',
        component: CorreccionRetestComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER', 'DESARROLLADOR'] }
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA', 'ANALISTA_TESTER', 'CLIENTE'] }
      },
      {
        path: 'configuracion',
        component: ConfiguracionComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'auditoria',
        component: ListaAuditoriaComponent,
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'LIDER_QA'] }
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
