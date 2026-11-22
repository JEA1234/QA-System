import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BusquedaGlobalResponse, Notificacion } from '../models/busqueda-notificaciones.model';
import { PageResponse } from './usuario.service';

@Injectable({ providedIn: 'root' })
export class BusquedaNotificacionesService {
  private readonly baseUrl = `${environment.apiUrl}`;

  private noLeidasSubject = new BehaviorSubject<number>(0);
  noLeidas$ = this.noLeidasSubject.asObservable();

  constructor(private http: HttpClient) {}

  busquedaGlobal(q: string, tipo?: string, proyectoId?: number): Observable<BusquedaGlobalResponse> {
    let params = new HttpParams().set('q', q);
    if (tipo) params = params.set('tipo', tipo);
    if (proyectoId) params = params.set('proyectoId', proyectoId.toString());

    return this.http.get<BusquedaGlobalResponse>(`${this.baseUrl}/busqueda/global`, { params });
  }

  listarNotificaciones(page = 0, size = 15): Observable<PageResponse<Notificacion>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Notificacion>>(`${this.baseUrl}/notificaciones`, { params });
  }

  actualizarConteoNoLeidas(): Observable<{ noLeidas: number }> {
    return this.http.get<{ noLeidas: number }>(`${this.baseUrl}/notificaciones/no-leidas/conteo`).pipe(
      tap(res => {
        this.noLeidasSubject.next(res?.noLeidas ?? 0);
      })
    );
  }

  marcarLeida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/notificaciones/${id}/leer`, null).pipe(
      tap(() => {
        const actual = Math.max(0, this.noLeidasSubject.value - 1);
        this.noLeidasSubject.next(actual);
      })
    );
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/notificaciones/leer-todas`, null).pipe(
      tap(() => {
        this.noLeidasSubject.next(0);
      })
    );
  }
}

