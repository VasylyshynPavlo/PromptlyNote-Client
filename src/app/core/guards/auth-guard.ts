import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = () => {
  const document = inject(DOCUMENT);
  const router = inject(Router);
  const api = inject(AuthService);

  const hasUserInfoCookie = document.cookie
    .split('; ')
    .some((cookie) => cookie.startsWith('user_info='));

  if (hasUserInfoCookie) {
    return true;
  }
  else {
    return router.createUrlTree(['/auth']);
  }
};
