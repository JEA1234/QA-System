export interface Requerimiento {
  id: number;
  codigo: string;
  proyectoId: number;
  proyectoNombre: string;
  moduloId?: number | null;
  moduloNombre?: string | null;
  descripcion: string;
  tipo: string;
  prioridad: string;
  estado: string;
  version: number;
  responsableId?: number | null;
  responsableNombre?: string | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  dependenciaIds?: number[];
}

export interface RequerimientoRequest {
  codigo: string;
  proyectoId: number;
  moduloId?: number | null;
  descripcion: string;
  tipo: string;
  prioridad: string;
  estado: string;
  responsableId?: number | null;
}

export interface ModuloResponse {
  id: number;
  proyectoId: number;
  nombre: string;
  descripcion?: string;
  estado: string;
}
