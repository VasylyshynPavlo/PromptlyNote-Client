import { Component, inject } from '@angular/core';
import { ErrorService } from '../../../core/services/error-service';

@Component({
  selector: 'app-error-toasts',
  templateUrl: './error-toasts.html',
})
export class ErrorToasts {
  protected readonly errorService = inject(ErrorService);
}
