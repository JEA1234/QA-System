export interface IncidenciaEvidencia {
  id: number;
  incidenciaId: number;
  nombre: string;
  urlRuta: string;
  tipo?: string;
  tamanoBytes: number;
  fecha?: string;
}

export interface IncidenciaComentario {
  id: number;
  incidenciaId: number;
  usuarioId?: number | null;
  usuarioNombre?: string | null;
  comentario: string;
  fecha: string;
}

export interface IncidenciaComentarioRequest {
  comentario: string;
}

export interface Incidencia {
  id: number;
  codigo: string;
  proyectoId: number;
  proyectoNombre: string;
  requerimientoId?: number | null;
  requerimientoCodigo?: string | null;
  requerimientoDescripcion?: string | null;
  ejecucionId?: number | null;
  titulo: string;
  descripcion: string;
  severidad: string; // CRITICA, MAYOR, MENOR, TRIVIAL
  prioridad: string; // ALTA, MEDIA, BAJA
  estado: string; // NUEVA, ASIGNADA, EN_RESOLUCION, RESUELTA, CERRADA, RECHAZADA
  responsableId?: number | null;
  responsableNombre?: string | null;
  creadorId?: number | null;
  creadorNombre?: string | null;
  versionBuild?: string | null;
  fechaLimiteSla?: string | null;
  slaVencido: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  evidencias?: IncidenciaEvidencia[];
  comentarios?: IncidenciaComentario[];
}

export interface IncidenciaRequest {
  codigo?: string;
  proyectoId: number;
  requerimientoId?: number | null;
  ejecucionId?: number | null;
  titulo: string;
  descripcion: string;
  severidad: string;
  prioridad: string;
  estado?: string;
  responsableId?: number | null;
  versionBuild?: string;
}

