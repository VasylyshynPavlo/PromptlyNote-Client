import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Service, signal } from '@angular/core';
import { finalize } from "rxjs";
import { environment } from "../../../environments/environment";
import { User } from "../interfaces/user";
import { ProblemDetails } from "../interfaces/problem-details";
import { RequestCallbacks } from "../interfaces/request-callbacks";

export type UserField = 'name';
export type FieldErrors = Partial<Record<UserField, string>>;

export interface UserErrors {
  fields: FieldErrors;
  general?: string;
}

const FIELD_MAP: Record<string, UserField> = {
  FullName: 'name',
};

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly user = signal<User | null>(null);
  readonly passwordError = signal('');

  private loaded = false;

  me(parameters: { includeTaskLists: boolean; includeTasks: boolean; includeCategories: boolean, force: boolean } = { includeTaskLists: true, includeTasks: true, includeCategories: true, force: false }) {
    if (this.loaded && !parameters.force) {
      return;
    }

    let queryParams = `includeTaskLists=${parameters.includeTaskLists}`;
    queryParams += `&includeTasks=${parameters.includeTasks}`;
    queryParams += `&includeCategories=${parameters.includeCategories}`;
    this.http.get<User>(`${this.apiUrl}/user?${queryParams}`).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loaded = true;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      },
    });
  }

  updateFullName(parameters: { fullName: string }, callbacks?: RequestCallbacks) {
    this.http
      .put(`${this.apiUrl}/user?fullName=${encodeURIComponent(parameters.fullName)}`, {})
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          const currentUser = this.user();
          if (currentUser) {
            this.user.set({ ...currentUser, fullName: parameters.fullName });
          }
          callbacks?.onSuccess?.();
        },
        error: (error) => {
          console.error('Error updating full name:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  deleteMe() {
    return this.http.delete(`${this.apiUrl}/user`);
  }

  changePassword(parameters: { currentPassword: string; newPassword: string }, callbacks?: RequestCallbacks) {
    this.passwordError.set('');
    this.http
      .put(`${this.apiUrl}/user/password/change`, parameters)
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          const currentUser = this.user();
          if (currentUser) {
            this.user.set({ ...currentUser, isPasswordSet: true });
          }
          callbacks?.onSuccess?.();
        },
        error: (error: HttpErrorResponse) => {
          const problem = error.error as ProblemDetails | null;
          this.passwordError.set(problem?.detail ?? 'Could not change password.');
          console.error('Error changing password:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  setPassword(parameters: { newPassword: string; code: string; redirectUri: string }, callbacks?: RequestCallbacks) {
    this.passwordError.set('');
    const url = `${this.apiUrl}/user/password/set`;
    this.http
      .put(url, { newPassword: parameters.newPassword, code: parameters.code, redirectUri: parameters.redirectUri })
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          const currentUser = this.user();
          if (currentUser) {
            this.user.set({ ...currentUser, isPasswordSet: true });
          }
          callbacks?.onSuccess?.();
        },
        error: (error) => {
          console.error('Error setting password:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  markGoogleCalendarConnected() {
    const currentUser = this.user();
    if (currentUser) {
      this.user.set({ ...currentUser, googleCalendar: true });
    }
  }

  setUser(user: User | null) {
    this.user.set(user);
    this.loaded = user !== null;
  }
}
