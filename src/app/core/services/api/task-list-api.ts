import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CreateTaskList } from '../../interfaces/auth/create-task-list';
import { UpdateTaskList } from '../../interfaces/auth/update-task-list';
import { TaskList } from '../../interfaces/task-list';
import { DataDetails } from '../../interfaces/data-details';

@Service()
export class TaskListApi {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  get(parameters: { id: string; includeTasks: boolean }) {
    let queryParams = `id=${parameters.id}`;
    queryParams += `&includeTasks=${parameters.includeTasks}`;
    return this.http.get<TaskList>(`${this.apiUrl}/tasklist/get?${queryParams}`);
  }

  create(parameters: CreateTaskList) {
    const body = new HttpParams()
      .set('Name', parameters.name)
      .set('Description', parameters.description)
      .set('IconName', parameters.iconName);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/tasklist/create`, body.toString(), { headers });
  }

  list(parameters: { page: number; pageSize: number; sortBy: number; includeTasks: boolean }) {
    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&includeTasks=${parameters.includeTasks}`;
    return this.http.get<DataDetails<TaskList>>(`${this.apiUrl}/tasklist/list?${queryParams}`);
  }

  update (parameters: { id: string; taskList: UpdateTaskList }) {
    const body = new HttpParams()
      .set('Name', parameters.taskList.name)
      .set('Description', parameters.taskList.description)
      .set('IconName', parameters.taskList.iconName);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.put(`${this.apiUrl}/tasklist/update?id=${parameters.id}`, body.toString(), { headers });
  }

  delete(parameters: { id: string }) {
    return this.http.delete(`${this.apiUrl}/tasklist/delete?id=${parameters.id}`);
  }
}