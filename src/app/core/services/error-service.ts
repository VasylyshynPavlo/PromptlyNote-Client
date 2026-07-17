import { Service, signal } from '@angular/core';

export interface ErrorToast {
  id: number;
  message: string;
}

const DISMISS_AFTER_MS = 6000;
const MAX_VISIBLE = 4;

@Service()
export class ErrorService {
  private readonly items = signal<ErrorToast[]>([]);
  readonly toasts = this.items.asReadonly();

  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(message: string): void {
    const visible = this.items();

    const existing = visible.find((toast) => toast.message === message);
    if (existing) {
      this.schedule(existing.id);
      return;
    }

    const toast: ErrorToast = { id: this.nextId++, message };
    const next = [...visible, toast];
    while (next.length > MAX_VISIBLE) {
      const dropped = next.shift();
      if (dropped) {
        this.clearTimer(dropped.id);
      }
    }

    this.items.set(next);
    this.schedule(toast.id);
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this.items.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const id of [...this.timers.keys()]) {
      this.clearTimer(id);
    }
    this.items.set([]);
  }

  private schedule(id: number): void {
    this.clearTimer(id);
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), DISMISS_AFTER_MS),
    );
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
