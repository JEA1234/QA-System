import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditoriaLog, AuditoriaResumen } from '../models/auditoria.model';
import { PageResponse } from './usuario.service';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly baseUrl = `${environment.apiUrl}/auditoria`;

  constructor(private http: HttpClient) {}

  buscar(filtros: {
    modulo?: string;
    accion?: string;
    usuarioId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    busqueda?: string;
    page?: number;
    size?: number;
  }): Observable<PageResponse<AuditoriaLog>> {
    let params = new HttpParams()
      .set('page', filtros.page ?? 0)
      .set('size', filtros.size ?? 15);

    if (filtros.modulo) params = params.set('modulo', filtros.modulo);
    if (filtros.accion) params = params.set('accion', filtros.accion);
    if (filtros.usuarioId) params = params.set('usuarioId', filtros.usuarioId);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);

    return this.http.get<PageResponse<AuditoriaLog>>(this.baseUrl, { params });
  }

  obtenerPorId(id: number): Observable<AuditoriaLog> {
    return this.http.get<AuditoriaLog>(`${this.baseUrl}/${id}`);
  }

  obtenerResumen(): Observable<AuditoriaResumen> {
    return this.http.get<AuditoriaResumen>(`${this.baseUrl}/resumen`);
  }

  exportarCsv(filtros: {
    modulo?: string;
    accion?: string;
    usuarioId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    busqueda?: string;
  }): Observable<Blob> {
    let params = new HttpParams();
    if (filtros.modulo) params = params.set('modulo', filtros.modulo);
    if (filtros.accion) params = params.set('accion', filtros.accion);
    if (filtros.usuarioId) params = params.set('usuarioId', filtros.usuarioId);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);

    return this.http.get(`${this.baseUrl}/exportar/csv`, {
      params,
      responseType: 'blob'
    });
  }
}

