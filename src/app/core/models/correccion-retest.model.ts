export interface Correccion {
  id: number;
  incidenciaId: number;
  incidenciaCodigo: string;
  desarrolladorId?: number | null;
  desarrolladorNombre?: string | null;
  descripcion: string;
  commitHash?: string | null;
  rama?: string | null;
  versionCodigo?: string | null;
  fecha: string;
}

export interface CorreccionRequest {
  incidenciaId: number;
  descripcion: string;
  commitHash?: string;
  rama?: string;
  versionCodigo?: string;
}

export interface Retest {
  id: number;
  incidenciaId: number;
  incidenciaCodigo: string;
  correccionId?: number | null;
  testerId?: number | null;
  testerNombre?: string | null;
  resultado: string; // APROBADO, FALLIDO
  observaciones?: string;
  intentoNumero: number;
  fecha: string;
}

export interface RetestRequest {
  incidenciaId: number;
  correccionId?: number | null;
  resultado: string;
  observaciones?: string;
}

export interface Reapertura {
  id: number;
  incidenciaId: number;
  incidenciaCodigo: string;
  usuarioId?: number | null;
  usuarioNombre?: string | null;
  motivo: string;
  fecha: string;
}

export interface ReaperturaRequest {
  incidenciaId: number;
  motivo: string;
}

