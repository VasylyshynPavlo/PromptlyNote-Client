import { inject, signal, Service } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { TaskList } from '../interfaces/task-list';
import { DataDetails } from '../interfaces/data-details';
import { CreateTaskList } from '../interfaces/api/create-task-list';
import { UpdateTaskList } from '../interfaces/api/update-task-list';

export interface TaskListQuery {
  page: number;
  pageSize: number;
  sortBy: number;
  includeTasks: boolean;
}

const DEFAULT_QUERY: TaskListQuery = { page: 0, pageSize: 10, sortBy: 0, includeTasks: false };

@Service()
export class TaskListService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  readonly loading = signal(false);
  readonly taskLists = signal<TaskList[]>([]);

  private loaded = false;

  list(parameters: TaskListQuery = DEFAULT_QUERY, force = false): void {
    if (this.loaded && !force) {
      return;
    }
    this.loading.set(true);

    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&includeTasks=${parameters.includeTasks}`;

    this.http.get<DataDetails<TaskList>>(`${this.apiUrl}/tasklist?${queryParams}`).subscribe({
      next: (response) => {
        this.taskLists.set(response.data);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error fetching task lists:', error);
      },
    });
  }

  get(parameters: { id: string; includeTasks: boolean }) {
    return this.http.get<TaskList>(`${this.apiUrl}/tasklist/${parameters.id}?includeTasks=${parameters.includeTasks}`);
  }

  create(parameters: CreateTaskList) {
    const body = new HttpParams()
      .set('Name', parameters.name)
      .set('Description', parameters.description)
      .set('IconName', parameters.iconName);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post(`${this.apiUrl}/tasklist`, body.toString(), { headers });
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

  /** Примусово перезавантажує списки, ігноруючи кеш. */
  reload(parameters: TaskListQuery = DEFAULT_QUERY): void {
    this.list(parameters, true);
  }
}
