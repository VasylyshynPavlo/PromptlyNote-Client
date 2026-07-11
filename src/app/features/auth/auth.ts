import { Component, signal } from '@angular/core';
import { AuthForm } from './components/auth-form/auth-form';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [AuthForm],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {
  register = signal(false);
}
