import { Service, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserService } from './user-service';
import { RequestCallbacks } from '../interfaces/request-callbacks';

@Service()
export class CalendarService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  private readonly formHeaders = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  connect(code: string, redirectUri: string, callbacks?: RequestCallbacks) {
    const body = new HttpParams().set('Code', code).set('RedirectUri', redirectUri);

    this.http
      .post(`${this.apiUrl}/calendar/connect`, body.toString(), { headers: this.formHeaders })
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          this.userService.markGoogleCalendarConnected();
          callbacks?.onSuccess?.();
        },
        error: (error) => {
          console.error('Error connecting Google Calendar:', error);
          callbacks?.onError?.(error);
        },
      });
  }
}
