export interface BusquedaItem {
  id: number;
  tipo: 'PROYECTO' | 'REQUERIMIENTO' | 'CASO_PRUEBA' | 'INCIDENCIA' | string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  estado?: string;
  extraInfo?: string;
  enlace: string;
}

export interface BusquedaGlobalResponse {
  query: string;
  totalResultados: number;
  items: BusquedaItem[];
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'INFO' | 'ALERTA' | 'ASIGNACION' | 'RETEST_PENDIENTE' | 'SLA_VENCIDO' | string;
  enlace?: string;
  leida: boolean;
  fechaCreacion: string;
}

