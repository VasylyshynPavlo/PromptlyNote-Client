import { Component, effect, inject, input, signal } from '@angular/core';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { finalize, switchMap, Observable } from 'rxjs';
import { TaskList } from '../../core/interfaces/task-list';
import { Task } from '../../core/interfaces/task';
import { TaskSerivce } from '../../core/services/task-serivce';
import { TaskListService } from '../../core/services/task-list-service';

@Component({
  selector: 'app-list-details',
  imports: [OverlayModule],
  templateUrl: './list-details.html',
})
export class ListDetails {
  private readonly api = inject(TaskListService);
  readonly taskService = inject(TaskSerivce);

  readonly id = input.required<string>();

  readonly taskList = signal<TaskList | null>(null);
  readonly loading = signal(false);

  readonly maxRemindMinutes = 40320;

  readonly reminderMenuTaskId = signal<string | null>(null);
  readonly reminderMinutesDraft = signal<number | null>(null);

  /** Ids of tasks with an in-flight update; those rows are blocked and show a busy border. */
  private readonly pendingTaskIds = signal<ReadonlySet<string>>(new Set());

  isTaskPending(taskId: string): boolean {
    return this.pendingTaskIds().has(taskId);
  }

  readonly reminderOverlayPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  constructor() {
    effect(() => this.load(this.id()));
  }

  toggleReminderMenu(task: Task): void {
    if (this.reminderMenuTaskId() === task.id) {
      this.closeReminderMenu();
      return;
    }
    this.reminderMinutesDraft.set(task.remindBeforeMinutes);
    this.reminderMenuTaskId.set(task.id);
  }

  closeReminderMenu(): void {
    this.reminderMenuTaskId.set(null);
  }

  applyReminder(taskId: string): void {
    const minutes = this.reminderMinutesDraft();
    if (minutes === null || minutes < 1 || minutes > this.maxRemindMinutes) {
      return;
    }
    this.saveReminder(taskId, minutes);
  }

  clearReminder(taskId: string): void {
    this.saveReminder(taskId, null);
  }

  private saveReminder(taskId: string, remindBeforeMinutes: number | null): void {
    const task = this.taskList()?.tasks?.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const updatedTask: Task = { ...task, remindBeforeMinutes };
    this.closeReminderMenu();
    this.runTaskMutation(taskId, this.taskService.update({ id: taskId, task: updatedTask }));
  }

  toggleGoogleCalendar(taskId: string, syncToGoogleCalendar: boolean): void {
    const action$ = syncToGoogleCalendar
      ? this.taskService.removeFromGoogleCalendar({ taskId })
      : this.taskService.addToGoogleCalendar({ taskId });

    this.runTaskMutation(taskId, action$);
  }

  toggleCompletion(task: Task): void {
    const updatedTask: Task = { ...task, isCompleted: !task.isCompleted };
    this.runTaskMutation(task.id, this.taskService.update({ id: task.id, task: updatedTask }));
  }

  /** Runs a task mutation while marking the row pending, then refetches and replaces it. */
  private runTaskMutation(taskId: string, mutation$: Observable<unknown>): void {
    if (this.isTaskPending(taskId)) {
      return;
    }

    this.setTaskPending(taskId, true);
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
        finalize(() => this.setTaskPending(taskId, false)),
      )
      .subscribe({
        next: (updated) => this.replaceTask(updated),
        error: (error) => {
          console.error(`Error updating task ${taskId}:`, error);
        },
      });
  }

  private setTaskPending(taskId: string, pending: boolean): void {
    this.pendingTaskIds.update((current) => {
      const next = new Set(current);
      if (pending) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  }

  private replaceTask(updated: Task): void {
    this.taskList.update((list) => {
      if (!list?.tasks) {
        return list;
      }
      return {
        ...list,
        tasks: list.tasks.map((task) => (task.id === updated.id ? updated : task)),
      };
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.api.get({ id, includeTasks: true }).subscribe({
      next: (list) => {
        this.taskList.set(list);
        this.loading.set(false);
        console.log('Task list fetched successfully:', list);
      },
      error: (error) => {
        this.taskList.set(null);
        this.loading.set(false);
        console.error('Error fetching task list:', error);
      },
    });
  }
}
