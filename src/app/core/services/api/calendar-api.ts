import { Service, inject } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Service()
export class CalendarApi {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  connect() {
    return this.http.get(`${this.apiUrl}/calendar/connect`);
  }
}
