export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  categoria: string;
  descripcion?: string;
  tipoDato: string;
  fechaActualizacion?: string;
}

export interface Catalogo {
  id: number;
  tipo: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
}

export interface CatalogoRequest {
  tipo: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

