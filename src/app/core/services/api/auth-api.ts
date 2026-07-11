import { Service, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ProblemDetails } from '../../interfaces/problem-details';


@Service()
export class AuthApi {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  login(creditals: { email: string; password: string }) {
    const body = new HttpParams()
      .set('Email', creditals.email)
      .set('Password', creditals.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/auth/login`, body.toString(), { headers });
  }

  register(creditals: { fullName: string; email: string; password: string }) {
    const body = new HttpParams()
      .set('FullName', creditals.fullName)
      .set('Email', creditals.email)
      .set('Password', creditals.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/auth/register`, body.toString(), { headers });
  }

  loginViaGoogle(creditals: { code: string; redirectUri: string }) {
    const body = new HttpParams()
      .set('Code', creditals.code)
      .set('RedirectUri', creditals.redirectUri);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/auth/login/google`, body.toString(), { headers });
  }

  logout() {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  isLoggedIn() {
    return this.http.get(`${this.apiUrl}/auth/isloggedin`);
  }
}
