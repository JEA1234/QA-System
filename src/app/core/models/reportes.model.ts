export interface KpiResumen {
  coberturaReqPct: number;
  totalRequerimientos: number;
  reqsConCobertura: number;
  coberturaCumpleMeta: boolean;

  passRatePct: number;
  totalCasosPrueba?: number;
  totalEjecuciones: number;
  ejecucionesPassed: number;
  ejecucionesFailed: number;
  ejecucionesBlocked: number;

  defectosAbiertos: number;
  defectosCriticos: number;
  defectosMayores: number;
  defectosMenores: number;
  defectosTriviales: number;
  defectosResueltos: number;

  mttrHoras: number;
  cumplimientoSlaPct: number;
  slaEstado: string;
}

export interface TendenciaDiaria {
  fecha: string;
  diaEtiqueta: string;
  aprobadas: number;
  fallidas: number;
  bloqueadas: number;
  total: number;
  estabilidadPct: number;
}

export interface DistribucionIncidencias {
  critica: number;
  mayor: number;
  menor: number;
  trivial: number;
  totalActivas: number;

  pctCritica: number;
  pctMayor: number;
  pctMenor: number;
  pctTrivial: number;

  nuevas: number;
  enAnalisis: number;
  enCorreccion: number;
  enRetest: number;
  cerradas: number;
}

export interface ProductividadQa {
  testerId: number;
  testerNombre: string;
  iniciales: string;
  rol: string;
  casosDisenados: number;
  casosEjecutados: number;
  defectosDetectados: number;
  ddrPct: number;
  horasTest: number;
}

export interface ProductividadDev {
  devId: number;
  devNombre: string;
  iniciales: string;
  rol: string;
  defectosAsignados: number;
  defectosCorregidos: number;
  efectividadPct: number;
  tiempoPromedioFixHoras: number;
}

export interface CertificacionRelease {
  aptoUat: boolean;
  estadoCertificacion: string;
  requerimientosCubiertos: number;
  totalRequerimientos: number;
  blockersActivos: number;
  reglaToleranciaCeroCumplida: boolean;
  tasaRegresionPct: number;
  auditTrailFirmado: boolean;
}

export interface DashboardReportes {
  proyectoId: number;
  proyectoCodigo: string;
  proyectoNombre: string;
  fechaSincronizacion: string;

  kpis: KpiResumen;
  tendencia: TendenciaDiaria[];
  distribucionIncidencias: DistribucionIncidencias;
  equipoQa: ProductividadQa[];
  equipoDev: ProductividadDev[];
  certificacion: CertificacionRelease;
}

