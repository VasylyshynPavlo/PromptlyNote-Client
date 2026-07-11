import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-auth-form',
  imports: [FormsModule],
  templateUrl: './auth-form.html',
})
export class AuthForm {
  private readonly authService = inject(AuthService);

  name = signal('');
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isRegistering = signal(false);

  readonly errors = this.authService.errors;

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.isRegistering() ? this.authService.register({
      fullName: this.name(),
      email: this.email(),
      password: this.password(),
    }) : this.authService.login({
      email: this.email(),
      password: this.password(),
    });
  }
}
