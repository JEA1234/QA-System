import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ejecucion,
  EjecucionRequest,
  Evidencia,
  AmbientePrueba,
  AmbienteRequest,
  CicloPrueba,
  CicloPruebaRequest
} from '../models/ejecucion.model';
import { PageResponse } from './usuario.service';

@Injectable({ providedIn: 'root' })
export class EjecucionService {
  private readonly baseUrl = `${environment.apiUrl}/ejecuciones`;
  private readonly ambientesUrl = `${environment.apiUrl}/ambientes`;
  private readonly ciclosUrl = `${environment.apiUrl}/ciclos-prueba`;

  constructor(private http: HttpClient) {}

  listar(filtros: {
    page?: number;
    size?: number;
    casoId?: number;
    proyectoId?: number;
    ambienteId?: number;
    cicloId?: number;
    usuarioId?: number;
    resultado?: string;
  }): Observable<PageResponse<Ejecucion>> {
    let params = new HttpParams()
      .set('page', filtros.page ?? 0)
      .set('size', filtros.size ?? 10);

    if (filtros.casoId) params = params.set('casoId', filtros.casoId);
    if (filtros.proyectoId) params = params.set('proyectoId', filtros.proyectoId);
    if (filtros.ambienteId) params = params.set('ambienteId', filtros.ambienteId);
    if (filtros.cicloId) params = params.set('cicloId', filtros.cicloId);
    if (filtros.usuarioId) params = params.set('usuarioId', filtros.usuarioId);
    if (filtros.resultado) params = params.set('resultado', filtros.resultado);

    return this.http.get<PageResponse<Ejecucion>>(this.baseUrl, { params });
  }

  buscarPorId(id: number): Observable<Ejecucion> {
    return this.http.get<Ejecucion>(`${this.baseUrl}/${id}`);
  }

  registrar(request: EjecucionRequest): Observable<Ejecucion> {
    return this.http.post<Ejecucion>(this.baseUrl, request);
  }

  actualizar(id: number, request: EjecucionRequest): Observable<Ejecucion> {
    return this.http.put<Ejecucion>(`${this.baseUrl}/${id}`, request);
  }

  historialPorCaso(casoId: number): Observable<Ejecucion[]> {
    return this.http.get<Ejecucion[]>(`${this.baseUrl}/caso/${casoId}/historial`);
  }

  subirEvidencia(ejecucionId: number, archivo: File): Observable<Evidencia> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<Evidencia>(`${this.baseUrl}/${ejecucionId}/evidencias`, formData);
  }

  listarEvidencias(ejecucionId: number): Observable<Evidencia[]> {
    return this.http.get<Evidencia[]>(`${this.baseUrl}/${ejecucionId}/evidencias`);
  }

  eliminarEvidencia(ejecucionId: number, evidenciaId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${ejecucionId}/evidencias/${evidenciaId}`);
  }

  // --- Catálogo de Ambientes (RQ-MOD06-05) ---
  listarAmbientes(soloActivos = true): Observable<AmbientePrueba[]> {
    const params = new HttpParams().set('soloActivos', soloActivos);
    return this.http.get<AmbientePrueba[]>(this.ambientesUrl, { params });
  }

  crearAmbiente(request: AmbienteRequest): Observable<AmbientePrueba> {
    return this.http.post<AmbientePrueba>(this.ambientesUrl, request);
  }

  cambiarEstadoAmbiente(id: number, estado: string): Observable<AmbientePrueba> {
    return this.http.patch<AmbientePrueba>(`${this.ambientesUrl}/${id}/estado`, null, {
      params: { valor: estado }
    });
  }

  // --- Ciclos de Prueba (RQ-MOD06-06) ---
  listarCiclos(proyectoId: number, estado?: string): Observable<CicloPrueba[]> {
    let params = new HttpParams().set('proyectoId', proyectoId);
    if (estado) params = params.set('estado', estado);
    return this.http.get<CicloPrueba[]>(this.ciclosUrl, { params });
  }

  crearCiclo(request: CicloPruebaRequest): Observable<CicloPrueba> {
    return this.http.post<CicloPrueba>(this.ciclosUrl, request);
  }
}

