import { inject, signal, Service } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TaskList } from '../interfaces/task-list';
import { Task } from '../interfaces/task';
import { DataDetails } from '../interfaces/data-details';
import { CreateTaskList } from '../interfaces/api/create-task-list';
import { UpdateTaskList } from '../interfaces/api/update-task-list';
import { RequestCallbacks, ResultCallbacks } from '../interfaces/request-callbacks';
import { TaskSerivce } from './task-serivce';

export interface TaskListQuery {
  page: number;
  pageSize: number;
  sortBy: number;
  isDescending: boolean;
}

const DEFAULT_QUERY: TaskListQuery = { page: 0, pageSize: 10, sortBy: 1, isDescending: false };

@Service()
export class TaskListService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly taskService = inject(TaskSerivce);

  readonly loading = signal(false);
  readonly taskLists = signal<DataDetails<TaskList>>({ data: [], count: 0, currentPage: 0, totalPages: 0 });

  private loaded = false;

  list(parameters: TaskListQuery = DEFAULT_QUERY, force = false): void {
    if (this.loaded && !force) {
      return;
    }
    this.loading.set(true);

    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&isDescending=${parameters.isDescending}`;

    this.http.get<DataDetails<TaskList>>(`${this.apiUrl}/tasklist?${queryParams}`).subscribe({
      next: (response) => {
        this.taskLists.set(response);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error fetching task lists:', error);
      },
    });
  }

  get(parameters: { id: string }) {
    return this.http.get<TaskList>(`${this.apiUrl}/tasklist/${parameters.id}`);
  }

  getWithTasks(id: string, callbacks?: ResultCallbacks<{ taskList: TaskList; tasks: Task[] }>) {
    this.get({ id })
      .pipe(
        switchMap((taskList) =>
          this.taskService
            .list({
              page: 0,
              pageSize: 100,
              sortBy: 0,
              includeCategory: true,
              includeTaskList: false,
              includeSubTasks: true,
              taskListFilter: id,
              isDescending: false,
            })
            .pipe(map((response) => ({ taskList, tasks: response.data }))),
        ),
        finalize(() => callbacks?.onSettled?.()),
      )
      .subscribe({
        next: (result) => callbacks?.onSuccess?.(result),
        error: (error) => {
          console.error('Error fetching task list:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  create(parameters: CreateTaskList, callbacks?: RequestCallbacks) {
    const body = new HttpParams()
      .set('Name', parameters.name)
      .set('Description', parameters.description)
      .set('IconName', parameters.iconName);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    this.http
      .post(`${this.apiUrl}/tasklist`, body.toString(), { headers })
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          this.reload();
          callbacks?.onSuccess?.();
        },
        error: (error) => {
          console.error('Error creating task list:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  update(parameters: { id: string; taskList: UpdateTaskList }) {
    const body = new HttpParams()
      .set('Name', parameters.taskList.name)
      .set('Description', parameters.taskList.description)
      .set('IconName', parameters.taskList.iconName);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.put(`${this.apiUrl}/tasklist/${parameters.id}`, body.toString(), {
      headers,
    });
  }

  delete(parameters: { id: string }) {
    return this.http.delete(`${this.apiUrl}/tasklist/${parameters.id}`);
  }

  reload(parameters: TaskListQuery = DEFAULT_QUERY): void {
    this.list(parameters, true);
  }
}
