import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatrizResumen } from '../models/trazabilidad.model';

@Injectable({ providedIn: 'root' })
export class TrazabilidadService {
  private readonly baseUrl = `${environment.apiUrl}/trazabilidad`;

  constructor(private http: HttpClient) {}

  obtenerMatriz(
    proyectoId: number,
    moduloId?: number | null,
    cobertura?: string | null
  ): Observable<MatrizResumen> {
    let params = new HttpParams().set('proyectoId', proyectoId.toString());
    if (moduloId) params = params.set('moduloId', moduloId.toString());
    if (cobertura) params = params.set('cobertura', cobertura);

    return this.http.get<MatrizResumen>(`${this.baseUrl}/matriz`, { params });
  }

  exportarCsv(proyectoId: number): Observable<Blob> {
    const params = new HttpParams().set('proyectoId', proyectoId.toString());
    return this.http.get(`${this.baseUrl}/exportar/csv`, {
      params,
      responseType: 'blob'
    });
  }
}

