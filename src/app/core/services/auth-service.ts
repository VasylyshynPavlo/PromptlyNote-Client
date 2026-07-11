import { HttpErrorResponse } from '@angular/common/http';
import { inject, signal, Service } from '@angular/core';
import { Router } from '@angular/router';
import { ProblemDetails } from '../interfaces/problem-details';
import { AuthApi } from './api/auth-api';

export type AuthField = 'name' | 'email' | 'password';
export type FieldErrors = Partial<Record<AuthField, string>>;

export interface AuthErrors {
  fields: FieldErrors;
  general?: string;
}

const FIELD_MAP: Record<string, AuthField> = {
  FullName: 'name',
  Email: 'email',
  Password: 'password',
};

export function toAuthErrors(e: HttpErrorResponse): AuthErrors {
  const problem = e.error as ProblemDetails | null;

  if (problem?.errors) {
    const fields: FieldErrors = {};
    for (const [backendKey, messages] of Object.entries(problem.errors)) {
      const field = FIELD_MAP[backendKey];
      if (field) fields[field] = messages[0];
    }
    return { fields };
  }

  return {
    fields: {},
    general: problem?.detail ?? 'Something went wrong. Please try again.',
  };
}

export interface AuthPayload {
  name: string;
  email: string;
  password: string;
}

@Service()
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  readonly errors = signal<AuthErrors>({ fields: {} });
  readonly loading = signal(false);

  login(creditals: { email: string; password: string }) {
    this.errors.set({ fields: {} });
    this.loading.set(true);

    this.api.login(creditals).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.errors.set(toAuthErrors(e));
      },
    });
  }

  register(creditals: { fullName: string; email: string; password: string }) {
    this.errors.set({ fields: {} });
    this.loading.set(true);

    this.api.register(creditals).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/');
      },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.errors.set(toAuthErrors(e));
      },
    });
  }

  logout() {
    this.api.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/auth');
      },
      error: (e: HttpErrorResponse) => {
        console.error('Logout failed:', e);
      },
    });
  }
}
