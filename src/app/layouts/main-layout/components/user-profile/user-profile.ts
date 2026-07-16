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
import { environment } from '../../../../../environments/environment';
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

  changeFullName(event: Event) {
    event.preventDefault();
    const fullName = this.newFullName().trim();
    if (!fullName) return;

    this.userService.updateFullName({ fullName }, {
      onSuccess: () => this.newFullName.set(''),
    });
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

    const params = new URLSearchParams({
      client_id: environment.googleClientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email',
      access_type: 'offline',
      prompt: 'consent',
    });

    this.document.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  ngOnDestroy(): void {
    this.close();
  }
}
