import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ProblemDetails } from '../interfaces/problem-details';
import { ErrorService } from '../services/error-service';

export const SKIP_ERROR_TOAST = new HttpContextToken(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const problem = toProblemDetails(error);

      if (!problem?.errors && !req.context.get(SKIP_ERROR_TOAST)) {
        errorService.show(toMessage(error, problem));
      }

      return throwError(() => error);
    }),
  );
};

function toProblemDetails(error: HttpErrorResponse): ProblemDetails | null {
  const body: unknown = error.error;
  if (!body || typeof body !== 'object' || body instanceof ProgressEvent || body instanceof Blob) {
    return null;
  }
  return body as ProblemDetails;
}

function toMessage(error: HttpErrorResponse, problem: ProblemDetails | null): string {
  const detail = problem?.detail?.trim() || problem?.title?.trim();
  if (detail) {
    return detail;
  }

  switch (error.status) {
    case 0:
      return 'Cannot reach the server. Check your connection.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have access to this.';
    case 404:
      return 'The requested item no longer exists.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
