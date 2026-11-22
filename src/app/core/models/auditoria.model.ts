export interface AuditoriaLog {
  id: number;
  usuarioId?: number;
  usuarioNombre: string;
  usuarioCorreo: string;
  modulo: string;
  accion: string;
  entidad?: string;
  entidadId?: number;
  descripcion: string;
  datosAnteriores?: string;
  datosNuevos?: string;
  ipOrigen: string;
  fecha: string;
}

export interface AuditoriaResumen {
  totalLogs: number;
  totalHoy: number;
  totalCreaciones: number;
  totalModificaciones: number;
  totalEliminaciones: number;
  totalEjecuciones: number;
  eventosPorModulo: Record<string, number>;
}

