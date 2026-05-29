import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const session = await authService.getSession();

  if (session) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

export const authChildGuard: CanActivateChildFn = authGuard;