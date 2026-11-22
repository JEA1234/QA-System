export interface PasoPrueba {
  id?: number;
  numero: number;
  accion: string;
  datoEntrada?: string;
  resultadoEsperado: string;
}

export interface CasoPrueba {
  id: number;
  codigo: string;
  requerimientoId: number;
  requerimientoCodigo: string;
  nombre: string;
  objetivo: string;
  precondiciones?: string;
  prioridad: string;
  estado: string;
  tipo: string;
  testerId?: number | null;
  testerNombre?: string | null;
  version: number;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  pasos: PasoPrueba[];
}

export interface PasoRequest {
  numero: number;
  accion: string;
  datoEntrada?: string;
  resultadoEsperado: string;
}

export interface CasoPruebaRequest {
  codigo: string;
  requerimientoId: number;
  nombre: string;
  objetivo: string;
  precondiciones?: string;
  prioridad: string;
  estado: string;
  tipo: string;
  testerId?: number | null;
  pasos: PasoRequest[];
}

export interface CasoVersionResponse {
  id: number;
  version: number;
  nombre: string;
  objetivo: string;
  precondiciones?: string;
  prioridad: string;
  estado: string;
  tipo: string;
  testerId?: number | null;
  testerNombre?: string | null;
  usuarioId?: number | null;
  usuarioNombre?: string | null;
  fecha: string;
}

export interface SuitePrueba {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: string;
  fechaCreacion?: string;
  casoIds: number[];
}

export interface SuiteRequest {
  nombre: string;
  descripcion?: string;
  estado?: string;
  casoIds: number[];
}
