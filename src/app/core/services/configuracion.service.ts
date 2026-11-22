import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Configuracion, Catalogo, CatalogoRequest } from '../models/configuracion.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly baseUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  listarConfiguraciones(categoria?: string): Observable<Configuracion[]> {
    let params = new HttpParams();
    if (categoria) params = params.set('categoria', categoria);
    return this.http.get<Configuracion[]>(this.baseUrl, { params });
  }

  obtenerPorClave(clave: string): Observable<Configuracion> {
    return this.http.get<Configuracion>(`${this.baseUrl}/${clave}`);
  }

  actualizar(clave: string, valor: string): Observable<Configuracion> {
    return this.http.put<Configuracion>(`${this.baseUrl}/${clave}`, { valor });
  }

  actualizarLote(valores: Record<string, string>): Observable<Configuracion[]> {
    return this.http.put<Configuracion[]>(`${this.baseUrl}/lote`, valores);
  }

  listarCatalogos(tipo: string, soloActivos = false): Observable<Catalogo[]> {
    const params = new HttpParams().set('soloActivos', soloActivos);
    return this.http.get<Catalogo[]>(`${this.baseUrl}/catalogos/${tipo}`, { params });
  }

  crearCatalogo(request: CatalogoRequest): Observable<Catalogo> {
    return this.http.post<Catalogo>(`${this.baseUrl}/catalogos`, request);
  }

  actualizarCatalogo(id: number, request: CatalogoRequest): Observable<Catalogo> {
    return this.http.put<Catalogo>(`${this.baseUrl}/catalogos/${id}`, request);
  }

  cambiarEstadoCatalogo(id: number, activo: boolean): Observable<Catalogo> {
    const params = new HttpParams().set('activo', activo);
    return this.http.patch<Catalogo>(`${this.baseUrl}/catalogos/${id}/estado`, null, { params });
  }
}

