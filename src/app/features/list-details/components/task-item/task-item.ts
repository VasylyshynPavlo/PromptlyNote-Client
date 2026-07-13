import { Component, inject, input, output, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { finalize, switchMap, Observable } from 'rxjs';
import { Task } from '../../../../core/interfaces/task';
import { TaskSerivce } from '../../../../core/services/task-serivce';
import { LocalDatePipe } from '../../../../core/pipes/local-date-pipe';

@Component({
  selector: 'app-task-item',
  imports: [OverlayModule, LocalDatePipe],
  templateUrl: './task-item.html',
  host: { class: 'block' },
})
export class TaskItem {
  private readonly taskService = inject(TaskSerivce);

  readonly task = input.required<Task>();

  /** Emits the refreshed task after a mutation so the parent can replace it in its list. */
  readonly taskChange = output<Task>();

  /** Maximum reminder lead time in minutes (28 days). */
  readonly maxRemindMinutes = 40320;

  /** True while an update is in flight; the row is blocked and shows a busy border. */
  readonly pending = signal(false);
  readonly reminderMenuOpen = signal(false);
  readonly reminderMinutesDraft = signal<number | null>(null);

  /** Overlay placement for the reminder dropdown: below the trigger, right-aligned, flips above if no room. */
  readonly reminderOverlayPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  toggleReminderMenu(): void {
    if (this.reminderMenuOpen()) {
      this.closeReminderMenu();
      return;
    }
    this.reminderMinutesDraft.set(this.task().remindBeforeMinutes);
    this.reminderMenuOpen.set(true);
  }

  closeReminderMenu(): void {
    this.reminderMenuOpen.set(false);
  }

  applyReminder(): void {
    const minutes = this.reminderMinutesDraft();
    if (minutes === null || minutes < 1 || minutes > this.maxRemindMinutes) {
      return;
    }
    this.saveReminder(minutes);
  }

  clearReminder(): void {
    this.saveReminder(null);
  }

  toggleCompletion(): void {
    const updated: Task = { ...this.task(), isCompleted: !this.task().isCompleted };
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  toggleGoogleCalendar(): void {
    const task = this.task();
    const action$ = task.syncToGoogleCalendar
      ? this.taskService.removeFromGoogleCalendar({ taskId: task.id })
      : this.taskService.addToGoogleCalendar({ taskId: task.id });

    this.runMutation(action$);
  }

  private saveReminder(remindBeforeMinutes: number | null): void {
    const updated: Task = { ...this.task(), remindBeforeMinutes };
    this.closeReminderMenu();
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  /** Runs a task mutation while marking the row pending, then refetches and emits the fresh task. */
  private runMutation(mutation$: Observable<unknown>): void {
    if (this.pending()) {
      return;
    }

    const taskId = this.task().id;
    this.pending.set(true);
    mutation$
      .pipe(
        switchMap(() =>
          this.taskService.get({
            id: taskId,
            includeCategory: false,
            includeTaskList: false,
            includeSubTasks: true,
          }),
        ),
        finalize(() => this.pending.set(false)),
      )
      .subscribe({
        next: (task) => this.taskChange.emit(task),
        error: (error) => {
          console.error(`Error updating task ${taskId}:`, error);
        },
      });
  }
}
