import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardReportes } from '../models/reportes.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  obtenerDashboard(proyectoId?: number): Observable<DashboardReportes> {
    let params = new HttpParams();
    if (proyectoId != null) {
      params = params.set('proyectoId', proyectoId.toString());
    }
    return this.http.get<DashboardReportes>(`${this.baseUrl}/dashboard`, { params });
  }

  exportarCsv(proyectoId: number): Observable<Blob> {
    const params = new HttpParams().set('proyectoId', proyectoId.toString());
    return this.http.get(`${this.baseUrl}/exportar/csv`, {
      params,
      responseType: 'blob'
    });
  }
}

