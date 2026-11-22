import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProyectoResponse, ProyectoRequest } from '../models/proyecto.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = '/api/proyectos';

  constructor(private http: HttpClient) {}

  listar(page: number = 0, size: number = 10, busqueda?: string, cliente?: string, estado?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (busqueda) params = params.set('busqueda', busqueda);
    if (cliente) params = params.set('cliente', cliente);
    if (estado) params = params.set('estado', estado);

    return this.http.get<any>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<ProyectoResponse> {
    return this.http.get<ProyectoResponse>(`${this.apiUrl}/${id}`);
  }

  crear(request: ProyectoRequest): Observable<ProyectoResponse> {
    return this.http.post<ProyectoResponse>(this.apiUrl, request);
  }

  editar(id: number, request: ProyectoRequest): Observable<ProyectoResponse> {
    return this.http.put<ProyectoResponse>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number, estado: string): Observable<ProyectoResponse> {
    return this.http.patch<ProyectoResponse>(`${this.apiUrl}/${id}/estado`, null, { params: { estado } });
  }

  duplicar(id: number, nuevoCodigo: string, nuevoNombre: string): Observable<ProyectoResponse> {
    let params = new HttpParams()
      .set('nuevoCodigo', nuevoCodigo)
      .set('nuevoNombre', nuevoNombre);
    return this.http.post<ProyectoResponse>(`${this.apiUrl}/${id}/duplicar`, null, { params });
  }
}