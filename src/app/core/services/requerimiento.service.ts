import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ModuloResponse, Requerimiento, RequerimientoRequest } from '../models/requerimiento.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class RequerimientoService {
  private readonly base = `${environment.apiUrl}/requerimientos`;

  constructor(private http: HttpClient) {}

  listar(filtros: { page?: number; size?: number; proyectoId?: number; moduloId?: number; estado?: string; prioridad?: string; busqueda?: string }): Observable<PageResponse<Requerimiento>> {
    let params = new HttpParams().set('page', filtros.page ?? 0).set('size', filtros.size ?? 10);
    if (filtros.proyectoId) params = params.set('proyectoId', filtros.proyectoId);
    if (filtros.moduloId) params = params.set('moduloId', filtros.moduloId);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    return this.http.get<PageResponse<Requerimiento>>(this.base, { params });
  }

  buscarPorId(id: number): Observable<Requerimiento> { return this.http.get<Requerimiento>(`${this.base}/${id}`); }
  crear(request: RequerimientoRequest): Observable<Requerimiento> { return this.http.post<Requerimiento>(this.base, request); }
  editar(id: number, request: RequerimientoRequest): Observable<Requerimiento> { return this.http.put<Requerimiento>(`${this.base}/${id}`, request); }
  cambiarEstado(id: number, estado: string): Observable<Requerimiento> { return this.http.patch<Requerimiento>(`${this.base}/${id}/estado`, null, { params: { valor: estado } }); }
  crearModulo(request: { proyectoId: number; nombre: string; descripcion?: string }): Observable<ModuloResponse> { return this.http.post<ModuloResponse>(`${this.base}/modulos`, request); }
  listarModulos(proyectoId: number): Observable<ModuloResponse[]> { return this.http.get<ModuloResponse[]>(`${this.base}/modulos`, { params: { proyectoId } }); }
}
