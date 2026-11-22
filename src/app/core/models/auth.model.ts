/** Interfaces TypeScript para el modulo de autenticacion (MOD-01) */

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nombres: string;
  apellidos: string;
  correo: string;
  roles: string[];
  debeCambiarPassword: boolean;
}

export interface UsuarioRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  password?: string;
  roles?: string[];
}

export interface UsuarioResponse {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  estado: string;
  roles: string[];
  cuentaBloqueada: boolean;
  ultimoAcceso: string | null;
  debeCambiarPassword: boolean;
  fechaCreacion: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  errores?: { [key: string]: string };
}
