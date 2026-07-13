import { Component, inject } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthForm } from './components/auth-form/auth-form';
import { AuthService } from '../../core/services/auth-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth',
  imports: [AuthForm],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  private readonly document = inject(DOCUMENT);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);

  private readonly redirectUri = `${this.document.location.origin}/auth`;

  constructor() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.location.replaceState('/auth');
      this.authService.loginWithGoogle({ code, redirectUri: this.redirectUri });
    }
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
