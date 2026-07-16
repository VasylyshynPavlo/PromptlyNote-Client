import { Component, inject } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthForm } from './components/auth-form/auth-form';
import { AuthService } from '../../core/services/auth-service';
import { UserService } from '../../core/services/user-service';
import {
  SET_PASSWORD_PENDING_KEY,
  SET_PASSWORD_VALUE_KEY,
} from '../../core/constants/set-password-flow';
import { environment } from '../../../environments/environment';

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

  private readonly redirectUri = `${this.document.location.origin}/auth`;

  constructor() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) return;

    this.location.replaceState('/auth');

    if (sessionStorage.getItem(SET_PASSWORD_PENDING_KEY)) {
      this.completeSetPassword(code);
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

  onGoogleLogin(): void {
    const params = new URLSearchParams({
      client_id: environment.googleClientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    this.document.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
