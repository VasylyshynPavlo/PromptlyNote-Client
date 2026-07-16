import { environment } from '../../../environments/environment';

export const GOOGLE_LOGIN_SCOPE = 'openid email profile';
export const GOOGLE_IDENTITY_SCOPE = 'openid email';
export const GOOGLE_CALENDAR_SCOPE =
  'openid email https://www.googleapis.com/auth/calendar.events';

export function googleOAuthUrl(redirectUri: string, scope: string): string {
  const params = new URLSearchParams({
    client_id: environment.googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
