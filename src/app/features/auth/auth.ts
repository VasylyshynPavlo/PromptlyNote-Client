import { Component, inject } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthForm } from './components/auth-form/auth-form';
import { AuthService } from '../../core/services/auth-service';
import { UserService } from '../../core/services/user-service';
import { CalendarService } from '../../core/services/calendar-service';
import {
  SET_PASSWORD_PENDING_KEY,
  SET_PASSWORD_VALUE_KEY,
} from '../../core/constants/set-password-flow';
import { CALENDAR_CONNECT_PENDING_KEY } from '../../core/constants/calendar-flow';
import { googleOAuthUrl, GOOGLE_LOGIN_SCOPE } from '../../core/utils/google-oauth';

@Component({
  selector: 'app-auth',
  imports: [AuthForm],
  templateUrl: './auth.html',
})
export class Auth {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly calendarService = inject(CalendarService);

  private readonly redirectUri = `${this.document.location.origin}/auth`;

  constructor() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) return;

    this.location.replaceState('/auth');

    if (sessionStorage.getItem(SET_PASSWORD_PENDING_KEY)) {
      this.completeSetPassword(code);
      return;
    }

    if (sessionStorage.getItem(CALENDAR_CONNECT_PENDING_KEY)) {
      this.completeCalendarConnect(code);
      return;
    }

    this.authService.loginWithGoogle({ code, redirectUri: this.redirectUri });
  }

  private completeSetPassword(code: string): void {
    const newPassword = sessionStorage.getItem(SET_PASSWORD_VALUE_KEY) ?? '';
    sessionStorage.removeItem(SET_PASSWORD_PENDING_KEY);
    sessionStorage.removeItem(SET_PASSWORD_VALUE_KEY);

    this.userService.setPassword(
      { newPassword, code, redirectUri: this.redirectUri },
      {
        onSuccess: () => this.router.navigateByUrl('/'),
        onError: () => this.router.navigateByUrl('/'),
      },
    );
  }

  private completeCalendarConnect(code: string): void {
    sessionStorage.removeItem(CALENDAR_CONNECT_PENDING_KEY);

    this.calendarService.connect(code, this.redirectUri, {
      onSuccess: () => this.router.navigateByUrl('/'),
      onError: () => this.router.navigateByUrl('/'),
    });
  }

  onGoogleLogin(): void {
    this.document.location.href = googleOAuthUrl(this.redirectUri, GOOGLE_LOGIN_SCOPE);
  }
}
