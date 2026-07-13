import { Component, effect, inject, input, signal } from '@angular/core';
import { TaskList } from '../../core/interfaces/task-list';
import { Task } from '../../core/interfaces/task';
import { TaskListService } from '../../core/services/task-list-service';
import { TaskItem } from './components/task-item/task-item';
import { AddTask } from './components/add-task/add-task';

@Component({
  selector: 'app-list-details',
  imports: [TaskItem, AddTask],
  templateUrl: './list-details.html',
  host: { class: 'block h-full min-h-0' },
})
export class ListDetails {
  private readonly api = inject(TaskListService);

  readonly id = input.required<string>();

  readonly taskList = signal<TaskList | null>(null);
  readonly loading = signal(false);

  constructor() {
    effect(() => this.load(this.id()));
  }

  replaceTask(updated: Task): void {
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
