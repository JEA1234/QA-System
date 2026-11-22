import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CasoPrueba, CasoPruebaRequest, CasoVersionResponse, SuitePrueba, SuiteRequest } from '../models/caso-prueba.model';
import { PageResponse } from './usuario.service';

@Injectable({ providedIn: 'root' })
export class CasoPruebaService {
  private readonly base = `${environment.apiUrl}/casos-prueba`;

  constructor(private http: HttpClient) {}

  listar(filtros: { page?: number; size?: number; requerimientoId?: number; proyectoId?: number; estado?: string; prioridad?: string; tipo?: string; testerId?: number; busqueda?: string }): Observable<PageResponse<CasoPrueba>> {
    let params = new HttpParams().set('page', filtros.page ?? 0).set('size', filtros.size ?? 10);
    if (filtros.requerimientoId) params = params.set('requerimientoId', filtros.requerimientoId);
    if (filtros.proyectoId) params = params.set('proyectoId', filtros.proyectoId);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.testerId) params = params.set('testerId', filtros.testerId);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    return this.http.get<PageResponse<CasoPrueba>>(this.base, { params });
  }

  buscarPorId(id: number): Observable<CasoPrueba> { return this.http.get<CasoPrueba>(`${this.base}/${id}`); }
  crear(request: CasoPruebaRequest): Observable<CasoPrueba> { return this.http.post<CasoPrueba>(this.base, request); }
  editar(id: number, request: CasoPruebaRequest): Observable<CasoPrueba> { return this.http.put<CasoPrueba>(`${this.base}/${id}`, request); }
  cambiarEstado(id: number, estado: string): Observable<CasoPrueba> { return this.http.patch<CasoPrueba>(`${this.base}/${id}/estado`, null, { params: { valor: estado } }); }
  duplicar(id: number, codigo: string, nombre: string): Observable<CasoPrueba> { return this.http.post<CasoPrueba>(`${this.base}/${id}/duplicar`, null, { params: { codigo, nombre } }); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  versiones(id: number): Observable<CasoVersionResponse[]> { return this.http.get<CasoVersionResponse[]>(`${this.base}/${id}/versiones`); }
  listarSuites(): Observable<SuitePrueba[]> { return this.http.get<SuitePrueba[]>(`${this.base}/suites`); }
  crearSuite(request: SuiteRequest): Observable<SuitePrueba> { return this.http.post<SuitePrueba>(`${this.base}/suites`, request); }
}
