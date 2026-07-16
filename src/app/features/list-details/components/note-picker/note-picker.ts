import { Component, input, output, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'app-note-picker',
  imports: [OverlayModule],
  templateUrl: './note-picker.html',
})
export class NotePicker {
  value = input<string>('');
  changed = output<string>();

  maxLength = 1000;
  open = signal(false);
  draft = signal('');

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
    this.changed.emit(this.draft().trim());
    this.close();
  }

  clear() {
    this.changed.emit('');
    this.close();
  }
}
