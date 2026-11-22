import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional: verifica que el usuario tenga al menos uno de los roles
 * indicados en route.data['roles']. RQ-MOD01-02.
 *
 * Uso en rutas:
 *   { path: 'usuarios', component: ..., canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR'] } }
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (auth.hasAnyRole(requiredRoles)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
