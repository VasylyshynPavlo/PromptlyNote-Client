import { inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
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

  // return api.isLoggedIn().pipe(
  //   map(() => true),
  //   catchError(() => of(router.createUrlTree(['/auth'])))
  // );
};
