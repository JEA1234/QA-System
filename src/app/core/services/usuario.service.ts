import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UsuarioListItem {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  estado: 'ACTIVO' | 'INACTIVO';
  cuentaBloqueada: boolean;
  intentosFallidos: number;
  debeCambiarPassword: boolean;
  ultimoAcceso?: string;
  roles: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private base = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(params: {
    page?: number;
    size?: number;
    busqueda?: string;
    estado?: string;
  }): Observable<PageResponse<UsuarioListItem>> {
    let p = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 10);
    if (params.busqueda) p = p.set('busqueda', params.busqueda);
    if (params.estado)   p = p.set('estado', params.estado);
    return this.http.get<PageResponse<UsuarioListItem>>(this.base, { params: p });
  }

  toggleEstado(id: number): Observable<UsuarioListItem> {
    return this.http.patch<UsuarioListItem>(`${this.base}/${id}/toggle-estado`, {});
  }

  desbloquear(id: number): Observable<UsuarioListItem> {
    return this.http.patch<UsuarioListItem>(`${this.base}/${id}/desbloquear`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}