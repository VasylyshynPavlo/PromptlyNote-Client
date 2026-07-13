import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, signal, Service } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ProblemDetails } from '../interfaces/problem-details';

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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly router = inject(Router);

  readonly errors = signal<AuthErrors>({ fields: {} });
  readonly loading = signal(false);

  private readonly formHeaders = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  login(creditals: { email: string; password: string }) {
    this.errors.set({ fields: {} });
    this.loading.set(true);

    const body = new HttpParams()
      .set('Email', creditals.email)
      .set('Password', creditals.password);

    this.http.post(`${this.apiUrl}/auth/login`, body.toString(), { headers: this.formHeaders }).subscribe({
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

    const body = new HttpParams()
      .set('FullName', creditals.fullName)
      .set('Email', creditals.email)
      .set('Password', creditals.password);

    this.http.post(`${this.apiUrl}/auth/register`, body.toString(), { headers: this.formHeaders }).subscribe({
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

  loginWithGoogle(payload: { code: string; redirectUri: string }) {
    this.errors.set({ fields: {} });
    this.loading.set(true);

    const body = new HttpParams()
      .set('Code', payload.code)
      .set('RedirectUri', payload.redirectUri);

    this.http.post(`${this.apiUrl}/auth/login/google`, body.toString(), { headers: this.formHeaders }).subscribe({
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
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        this.router.navigateByUrl('/auth');
      },
      error: (e: HttpErrorResponse) => {
        console.error('Logout failed:', e);
      },
    });
  }
}
