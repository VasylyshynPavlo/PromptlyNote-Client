import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorToasts } from './shared/components/error-toasts/error-toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorToasts],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('client');
}
