export interface AmbientePrueba {
  id: number;
  nombre: string;
  descripcion?: string;
  urlServidor?: string;
  estado: string;
  fechaCreacion?: string;
}

export interface AmbienteRequest {
  nombre: string;
  descripcion?: string;
  urlServidor?: string;
  estado?: string;
}

export interface CicloPrueba {
  id: number;
  proyectoId: number;
  proyectoNombre?: string;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: string;
  fechaCreacion?: string;
}

export interface CicloPruebaRequest {
  proyectoId: number;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
}

export interface Evidencia {
  id: number;
  ejecucionId: number;
  nombre: string;
  urlRuta: string;
  tipo?: string;
  tamanoBytes: number;
  fecha?: string;
}

export interface Ejecucion {
  id: number;
  casoId: number;
  casoCodigo: string;
  casoNombre: string;
  requerimientoId: number;
  requerimientoCodigo: string;
  usuarioId?: number | null;
  usuarioNombre?: string | null;
  ambienteId?: number | null;
  ambienteNombre?: string | null;
  cicloId?: number | null;
  cicloNombre?: string | null;
  fechaEjecucion: string;
  resultado: string; // PENDIENTE, EN_EJECUCION, APROBADO, FALLIDO, BLOQUEADO, NO_APLICA
  duracionSegundos?: number;
  observaciones?: string;
  numeroEjecucion: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  evidencias?: Evidencia[];
}

export interface EjecucionRequest {
  casoId: number;
  ambienteId?: number | null;
  cicloId?: number | null;
  resultado: string;
  duracionSegundos?: number;
  observaciones?: string;
}

