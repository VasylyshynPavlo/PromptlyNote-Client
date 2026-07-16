import {
  Component,
  inject,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { AuthService } from '../../../../core/services/auth-service';
import { DrawerService } from '../../../../core/services/drawer-service';
import { UserService } from '../../../../core/services/user-service';
import {
  SET_PASSWORD_PENDING_KEY,
  SET_PASSWORD_VALUE_KEY,
} from '../../../../core/constants/set-password-flow';
import { CALENDAR_CONNECT_PENDING_KEY } from '../../../../core/constants/calendar-flow';
import {
  googleOAuthUrl,
  GOOGLE_IDENTITY_SCOPE,
  GOOGLE_LOGIN_SCOPE,
  GOOGLE_CALENDAR_SCOPE,
} from '../../../../core/utils/google-oauth';
import { CategoryManager } from './category-manager/category-manager';

@Component({
  selector: 'app-user-profile',
  imports: [A11yModule, CategoryManager],
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnDestroy {
  private readonly drawerService = inject(DrawerService);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);

  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);

  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  readonly open = signal(false);

  readonly newFullName = signal('');

  readonly currentPassword = signal('');
  readonly newPassword = signal('');

  private get redirectUri(): string {
    return `${this.document.location.origin}/auth`;
  }

  toggle() {
    if (this.open()) {
      this.close();
      return;
    }

    this.overlayRef = this.drawerService.open({
      template: this.panel(),
      viewContainerRef: this.viewContainerRef,
      side: 'right',
      close: () => this.close(),
    });
    this.open.set(true);
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.open.set(false);
  }

  logout() {
    this.close();
    this.authService.logout();
  }

  changePassword(event: Event) {
    event.preventDefault();
    const currentPassword = this.currentPassword();
    const newPassword = this.newPassword();
    if (!currentPassword || newPassword.length < 6) return;

    this.userService.changePassword({ currentPassword, newPassword }, {
      onSuccess: () => {
        this.currentPassword.set('');
        this.newPassword.set('');
      },
    });
  }

  startSetPassword(event: Event) {
    event.preventDefault();
    this.userService.passwordError.set('');
    const newPassword = this.newPassword();
    if (newPassword.length < 6) return;

    sessionStorage.setItem(SET_PASSWORD_PENDING_KEY, '1');
    sessionStorage.setItem(SET_PASSWORD_VALUE_KEY, newPassword);

    this.document.location.href = googleOAuthUrl(this.redirectUri, GOOGLE_IDENTITY_SCOPE);
  }

  connectGoogle(event: Event) {
    event.preventDefault();
    this.document.location.href = googleOAuthUrl(this.redirectUri, GOOGLE_LOGIN_SCOPE);
  }

  connectGoogleCalendar(event: Event) {
    event.preventDefault();
    sessionStorage.setItem(CALENDAR_CONNECT_PENDING_KEY, '1');
    this.document.location.href = googleOAuthUrl(this.redirectUri, GOOGLE_CALENDAR_SCOPE);
  }

  ngOnDestroy(): void {
    this.close();
  }
}
