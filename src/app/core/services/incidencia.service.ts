import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Incidencia,
  IncidenciaRequest,
  IncidenciaEvidencia,
  IncidenciaComentario,
  IncidenciaComentarioRequest
} from '../models/incidencia.model';
import { PageResponse } from './usuario.service';

@Injectable({ providedIn: 'root' })
export class IncidenciaService {
  private readonly baseUrl = `${environment.apiUrl}/incidencias`;

  constructor(private http: HttpClient) {}

  listar(filtros: {
    page?: number;
    size?: number;
    proyectoId?: number;
    requerimientoId?: number;
    estado?: string;
    severidad?: string;
    prioridad?: string;
    responsableId?: number;
    busqueda?: string;
  }): Observable<PageResponse<Incidencia>> {
    let params = new HttpParams()
      .set('page', filtros.page ?? 0)
      .set('size', filtros.size ?? 10);

    if (filtros.proyectoId) params = params.set('proyectoId', filtros.proyectoId);
    if (filtros.requerimientoId) params = params.set('requerimientoId', filtros.requerimientoId);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.severidad) params = params.set('severidad', filtros.severidad);
    if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);
    if (filtros.responsableId) params = params.set('responsableId', filtros.responsableId);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);

    return this.http.get<PageResponse<Incidencia>>(this.baseUrl, { params });
  }

  buscarPorId(id: number): Observable<Incidencia> {
    return this.http.get<Incidencia>(`${this.baseUrl}/${id}`);
  }

  crear(request: IncidenciaRequest): Observable<Incidencia> {
    return this.http.post<Incidencia>(this.baseUrl, request);
  }

  editar(id: number, request: IncidenciaRequest): Observable<Incidencia> {
    return this.http.put<Incidencia>(`${this.baseUrl}/${id}`, request);
  }

  asignarResponsable(id: number, responsableId?: number | null): Observable<Incidencia> {
    let params = new HttpParams();
    if (responsableId != null) {
      params = params.set('responsableId', responsableId);
    }
    return this.http.patch<Incidencia>(`${this.baseUrl}/${id}/responsable`, null, { params });
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<Incidencia> {
    const params = new HttpParams().set('valor', nuevoEstado);
    return this.http.patch<Incidencia>(`${this.baseUrl}/${id}/estado`, null, { params });
  }

  subirEvidencia(incidenciaId: number, archivo: File): Observable<IncidenciaEvidencia> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<IncidenciaEvidencia>(`${this.baseUrl}/${incidenciaId}/evidencias`, formData);
  }

  eliminarEvidencia(incidenciaId: number, evidenciaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${incidenciaId}/evidencias/${evidenciaId}`);
  }

  agregarComentario(incidenciaId: number, request: IncidenciaComentarioRequest): Observable<IncidenciaComentario> {
    return this.http.post<IncidenciaComentario>(`${this.baseUrl}/${incidenciaId}/comentarios`, request);
  }

  listarComentarios(incidenciaId: number): Observable<IncidenciaComentario[]> {
    return this.http.get<IncidenciaComentario[]>(`${this.baseUrl}/${incidenciaId}/comentarios`);
  }
}

