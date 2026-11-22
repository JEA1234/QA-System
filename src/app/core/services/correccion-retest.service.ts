import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Correccion,
  CorreccionRequest,
  Retest,
  RetestRequest,
  Reapertura,
  ReaperturaRequest
} from '../models/correccion-retest.model';

@Injectable({ providedIn: 'root' })
export class CorreccionRetestService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- Correcciones (RQ-MOD08-05, RQ-MOD08-06) ---
  registrarCorreccion(request: CorreccionRequest): Observable<Correccion> {
    return this.http.post<Correccion>(`${this.apiUrl}/correcciones`, request);
  }

  historialCorrecciones(incidenciaId: number): Observable<Correccion[]> {
    return this.http.get<Correccion[]>(`${this.apiUrl}/correcciones/incidencia/${incidenciaId}`);
  }

  // --- Retests (RQ-MOD08-01, RQ-MOD08-02, RQ-MOD08-03) ---
  ejecutarRetest(request: RetestRequest): Observable<Retest> {
    return this.http.post<Retest>(`${this.apiUrl}/retests`, request);
  }

  historialRetests(incidenciaId: number): Observable<Retest[]> {
    return this.http.get<Retest[]>(`${this.apiUrl}/retests/incidencia/${incidenciaId}`);
  }

  // --- Reaperturas (RQ-MOD08-04, RN-008) ---
  reabrirIncidencia(request: ReaperturaRequest): Observable<Reapertura> {
    return this.http.post<Reapertura>(`${this.apiUrl}/reaperturas`, request);
  }

  historialReaperturas(incidenciaId: number): Observable<Reapertura[]> {
    return this.http.get<Reapertura[]>(`${this.apiUrl}/reaperturas/incidencia/${incidenciaId}`);
  }
}

