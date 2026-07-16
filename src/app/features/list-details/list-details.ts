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
  readonly tasks = signal<Task[] | null>(null);
  readonly loading = signal(false);

  constructor() {
    effect(() => this.load(this.id()));
  }

  reload(): void {
    this.load(this.id());
  }

  replaceTask(updated: Task): void {
    this.tasks.update((tasks) =>
      tasks ? tasks.map((task) => (task.id === updated.id ? updated : task)) : tasks,
    );
  }

  removeTask(taskId: string): void {
    this.tasks.update((tasks) => (tasks ? tasks.filter((task) => task.id !== taskId) : tasks));
  }

  private load(id: string): void {
    this.loading.set(true);
    this.api.getWithTasks(id, {
      onSuccess: ({ taskList, tasks }) => {
        this.taskList.set(taskList);
        this.tasks.set(tasks);
      },
      onError: () => {
        this.taskList.set(null);
        this.tasks.set(null);
      },
      onSettled: () => this.loading.set(false),
    });
  }
}
