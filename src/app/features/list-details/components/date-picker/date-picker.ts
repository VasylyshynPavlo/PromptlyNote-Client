import { Component, computed, input, output, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { LocalDatePipe } from '../../../../core/pipes/local-date-pipe';

@Component({
  selector: 'app-date-picker',
  imports: [OverlayModule, LocalDatePipe],
  templateUrl: './date-picker.html',
})
export class DatePicker {
  value = input<string | null>(null);
  changed = output<string | null>();

  open = signal(false);
  draft = signal<Date | null>(null);
  month = signal(this.startOfMonth(new Date()));

  weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  positions: ConnectedPosition[] = [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  monthLabel = computed(() =>
    new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(this.month()),
  );

  days = computed(() => {
    const m = this.month();
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const start = (first.getDay() + 6) % 7;
    return Array.from(
      { length: 42 },
      (_, i) => new Date(first.getFullYear(), first.getMonth(), 1 - start + i),
    );
  });

  time = computed(() => {
    const d = this.draft();
    if (!d) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  toggle() {
    if (this.open()) {
      this.close();
      return;
    }
    const d = this.parse(this.value());
    this.draft.set(d);
    this.month.set(this.startOfMonth(d ?? new Date()));
    this.open.set(true);
  }

  close() {
    this.open.set(false);
  }

  prevMonth() {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  nextMonth() {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  selectDay(day: Date) {
    const d = this.draft();
    const h = d ? d.getHours() : 0;
    const min = d ? d.getMinutes() : 0;
    this.draft.set(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, min));
  }

  setTime(value: string) {
    const [h, m] = value.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const base = this.draft() ?? new Date();
    this.draft.set(new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m));
  }

  set() {
    const d = this.draft();
    if (!d) return;
    this.changed.emit(d.toISOString());
    this.close();
  }

  clear() {
    this.changed.emit(null);
    this.close();
  }

  isSelected(day: Date) {
    return this.sameDay(day, this.draft());
  }

  isToday(day: Date) {
    return this.sameDay(day, new Date());
  }

  inMonth(day: Date) {
    return day.getMonth() === this.month().getMonth();
  }

  private startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  private sameDay(a: Date, b: Date | null) {
    return (
      !!b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private parse(value: string | null): Date | null {
    if (!value) return null;
    const s = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(value) ? value + 'Z' : value;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
}
