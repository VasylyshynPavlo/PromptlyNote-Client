import { TaskList } from './../interfaces/task-list';
import { inject, signal, Service } from '@angular/core';
import { TaskListApi } from './api/task-list-api';
import { DataDetails } from '../interfaces/data-details';

export interface TaskListQuery {
  page: number;
  pageSize: number;
  sortBy: number;
  includeTasks: boolean;
}

@Service()
export class TaskListService {
  private readonly api = inject(TaskListApi);
  readonly loading = signal(false);
  readonly taskLists = signal<TaskList[]>([]);

  list(
    parameters: TaskListQuery = { page: 0, pageSize: 10, sortBy: 0, includeTasks: false },
  ): void {
    this.loading.set(true);

    this.api.list(parameters).subscribe({
      next: (response) => {
        this.taskLists.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error fetching task lists:', error);
      },
    });
  }
}
