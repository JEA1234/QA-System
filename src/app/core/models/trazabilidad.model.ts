export interface IncidenciaTrazabilidad {
  id: number;
  codigo: string;
  titulo: string;
  severidad: string;
  estado: string;
  responsable?: string;
}

export interface EjecucionTrazabilidad {
  id: number;
  resultado: string;
  ambiente?: string;
  fecha: string;
  duracionSegundos?: number;
  incidencias: IncidenciaTrazabilidad[];
}

export interface CasoTrazabilidad {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  prioridad: string;
  estado: string;
  testerAsignado?: string;
  ultimaEjecucion?: EjecucionTrazabilidad;
}

export interface FilaMatriz {
  requerimientoId: number;
  requerimientoCodigo: string;
  requerimientoDescripcion: string;
  moduloNombre?: string;
  coberturaEstado: 'SIN_COBERTURA' | 'PENDIENTE' | 'APROBADO' | 'FALLIDO' | string;
  totalCasos: number;
  casosEjecutados: number;
  casosAprobados: number;
  casosFallidos: number;
  casosPendientes: number;
  casos: CasoTrazabilidad[];
  expandido?: boolean;
}

export interface MatrizResumen {
  proyectoId: number;
  proyectoNombre: string;
  totalRequerimientos: number;
  requerimientosConCobertura: number;
  requerimientosSinCobertura: number;
  porcentajeCobertura: number;
  requerimientosAprobados: number;
  requerimientosFallidos: number;
  requerimientosPendientes: number;
  filas: FilaMatriz[];
}

