import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { CreateTask, CreateSubTask } from '../../interfaces/auth/create-task';
import { UpdateSubTask } from '../../interfaces/auth/update-sub-task';

@Service()
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  get(parameters: { id: string; includeCategory: boolean; includeTaskList: boolean; includeSubTasks: boolean }) {
    let queryParams = 'id=${parameters.id}';
    queryParams += `&includeCategory=${parameters.includeCategory}`;
    queryParams += `&includeTaskList=${parameters.includeTaskList}`;
    queryParams += `&includeSubTasks=${parameters.includeSubTasks}`;
    return this.http.get(`${this.apiUrl}/task/get?${queryParams}`);
  }

  list(parameters: { page: number; pageSize: number; sortBy: number; includeCategory: boolean; includeTaskList: boolean; includeSubTasks: boolean }) {
    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&includeCategory=${parameters.includeCategory}`;
    queryParams += `&includeTaskList=${parameters.includeTaskList}`;
    queryParams += `&includeSubTasks=${parameters.includeSubTasks}`;
    return this.http.get(`${this.apiUrl}/task/list?${queryParams}`);
  }

  create(parameters: CreateTask) {
    return this.http.post(`${this.apiUrl}/task/create`, parameters);
  }

  update(parameters: { id: string; task: CreateTask }) {
    return this.http.put(`${this.apiUrl}/task/update?id=${parameters.id}`, parameters.task);
  }

  delete(parameters: { id: string }) {
    return this.http.delete(`${this.apiUrl}/task/delete?id=${parameters.id}`);
  }

  addSubTask(parameters: { taskId: string; subTask: CreateSubTask }) {
    const body = new HttpParams()
      .set('Name', parameters.subTask.name)
      .set('IsCompleted', parameters.subTask.isCompleted.toString());

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/task/addsubtask`, body.toString(), { headers });
  }

  updateSubTask(parameters: { taskId: string; subTask: UpdateSubTask }) {
    const body = new HttpParams()
      .set('Id', parameters.subTask.id)
      .set('Name', parameters.subTask.name)
      .set('IsCompleted', parameters.subTask.isCompleted.toString());

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.put(`${this.apiUrl}/task/updatesubtask?taskId=${parameters.taskId}`, body.toString(), { headers });
  }

  deleteSubTask(parameters: { taskId: string; subTaskId: string }) {
    return this.http.delete(`${this.apiUrl}/task/deletesubtask?taskId=${parameters.taskId}&subTaskId=${parameters.subTaskId}`);
  }

  replaceSubTasks(parameters: { taskId: string; subTasks: CreateSubTask[] }) {
    return this.http.put(`${this.apiUrl}/task/replacesubtasks?taskId=${parameters.taskId}`, parameters.subTasks);
  }
}