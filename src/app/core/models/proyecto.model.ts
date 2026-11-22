export interface ProyectoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  cliente: string;
  liderQaId: number;
  liderQaNombre: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  fechaCreacion: string;
  equipo: { id: number; nombres: string; apellidos: string }[];
}

export interface ProyectoRequest {
  codigo: string;
  nombre: string;
  descripcion: string;
  cliente: string;
  liderQaId: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  equipoIds: number[];
}