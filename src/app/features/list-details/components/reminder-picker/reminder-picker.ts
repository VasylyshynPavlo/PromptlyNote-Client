import { Component, input, output, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'app-reminder-picker',
  imports: [OverlayModule],
  templateUrl: './reminder-picker.html',
})
export class ReminderPicker {
  value = input<number | null>(null);
  disabled = input(false);
  changed = output<number | null>();

  max = 40320;
  open = signal(false);
  draft = signal<number | null>(null);

  positions: ConnectedPosition[] = [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  toggle() {
    if (this.open()) {
      this.close();
      return;
    }
    this.draft.set(this.value());
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  set() {
    const min = this.draft();
    if (min === null || min < 1 || min > this.max) return;
    this.changed.emit(min);
    this.close();
  }

  clear() {
    this.changed.emit(null);
    this.close();
  }
}
