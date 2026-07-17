import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Task } from '../interfaces/task';
import { DataDetails } from '../interfaces/data-details';
import { CreateTask, CreateSubTask } from '../interfaces/api/create-task';
import { RequestCallbacks, ResultCallbacks } from '../interfaces/request-callbacks';

@Service()
export class TaskSerivce {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  get(parameters: {
    id: string;
    includeCategory: boolean;
    includeTaskList: boolean;
    includeSubTasks?: boolean;
  }) {
    let queryParams = `includeCategory=${parameters.includeCategory}`;
    queryParams += `&includeTaskList=${parameters.includeTaskList}`;
    queryParams += `&includeSubTasks=${parameters.includeSubTasks ?? false}`;
    return this.http.get<Task>(`${this.apiUrl}/task/${parameters.id}?${queryParams}`);
  }

  list(parameters: {
    page: number;
    pageSize: number;
    sortBy: number;
    isDescending: boolean;
    includeCategory: boolean;
    includeTaskList: boolean;
    includeSubTasks?: boolean;
    categoryFilter?: string | null;
    taskListFilter?: string | null;
  }) {
    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&includeCategory=${parameters.includeCategory}`;
    queryParams += `&includeTaskList=${parameters.includeTaskList}`;
    queryParams += `&includeSubTasks=${parameters.includeSubTasks ?? false}`;
    queryParams += `&isDescending=${parameters.isDescending}`;
    if (parameters.categoryFilter) {
      queryParams += `&categoryFilter=${encodeURIComponent(parameters.categoryFilter)}`;
    }
    if (parameters.taskListFilter) {
      queryParams += `&taskListFilter=${encodeURIComponent(parameters.taskListFilter)}`;
    }
    return this.http.get<DataDetails<Task>>(`${this.apiUrl}/task?${queryParams}`);
  }

  create(parameters: CreateTask, callbacks?: RequestCallbacks) {
    this.http
      .post(`${this.apiUrl}/task`, parameters)
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => callbacks?.onSuccess?.(),
        error: (error) => {
          console.error('Error creating task:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  update(parameters: { id: string; task: CreateTask }) {
    return this.http.put(`${this.apiUrl}/task/${parameters.id}`, parameters.task);
  }

  delete(parameters: { id: string }, callbacks?: RequestCallbacks) {
    this.http
      .delete(`${this.apiUrl}/task/${parameters.id}`)
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => callbacks?.onSuccess?.(),
        error: (error) => {
          console.error('Error deleting task:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  search(parameters: { term: string; page: number; pageSize: number }) {
    let queryParams = `term=${encodeURIComponent(parameters.term)}`;
    queryParams += `&page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    return this.http.get<DataDetails<Task>>(`${this.apiUrl}/task/search?${queryParams}`);
  }

  mutateAndReload(
    mutation$: Observable<unknown>,
    parameters: {
      id: string;
      includeCategory: boolean;
      includeTaskList: boolean;
      includeSubTasks?: boolean;
    },
    callbacks?: ResultCallbacks<Task>,
  ) {
    mutation$
      .pipe(
        switchMap(() => this.get(parameters)),
        finalize(() => callbacks?.onSettled?.()),
      )
      .subscribe({
        next: (task) => callbacks?.onSuccess?.(task),
        error: (error) => {
          console.error('Error updating task:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  replaceSubTasks(parameters: { taskId: string; subTasks: CreateSubTask[] }) {
    return this.http.put(`${this.apiUrl}/task/${parameters.taskId}/subtasks`, parameters.subTasks);
  }

  addToGoogleCalendar(parameters: { taskId: string }) {
    return this.http.post(`${this.apiUrl}/task/${parameters.taskId}/calendar`, null);
  }

  removeFromGoogleCalendar(parameters: { taskId: string }) {
    return this.http.delete(`${this.apiUrl}/task/${parameters.taskId}/calendar`);
  }
}
