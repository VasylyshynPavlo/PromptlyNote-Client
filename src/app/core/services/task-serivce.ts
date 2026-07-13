import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Task } from '../interfaces/task';
import { CreateTask, CreateSubTask } from '../interfaces/api/create-task';
import { UpdateSubTask } from '../interfaces/api/update-sub-task';

@Service()
export class TaskSerivce {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  get(parameters: {
    id: string;
    includeCategory: boolean;
    includeTaskList: boolean;
    includeSubTasks: boolean;
  }) {
    let queryParams = `includeCategory=${parameters.includeCategory}`;
    queryParams += `&includeTaskList=${parameters.includeTaskList}`;
    queryParams += `&includeSubTasks=${parameters.includeSubTasks}`;
    return this.http.get<Task>(`${this.apiUrl}/task/${parameters.id}?${queryParams}`);
  }

  list(parameters: {
    page: number;
    pageSize: number;
    sortBy: number;
    includeCategory: boolean;
    includeTaskList: boolean;
    includeSubTasks: boolean;
  }) {
    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&includeCategory=${parameters.includeCategory}`;
    queryParams += `&includeTaskList=${parameters.includeTaskList}`;
    queryParams += `&includeSubTasks=${parameters.includeSubTasks}`;
    return this.http.get(`${this.apiUrl}/task?${queryParams}`);
  }

  create(parameters: CreateTask) {
    return this.http.post(`${this.apiUrl}/task`, parameters);
  }

  update(parameters: { id: string; task: CreateTask }) {
    return this.http.put(`${this.apiUrl}/task/${parameters.id}`, parameters.task);
  }

  delete(parameters: { id: string }) {
    return this.http.delete(`${this.apiUrl}/task/${parameters.id}`);
  }

  addSubTask(parameters: { taskId: string; subTask: CreateSubTask }) {
    const body = new HttpParams()
      .set('Name', parameters.subTask.name)
      .set('IsCompleted', parameters.subTask.isCompleted.toString());

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post(`${this.apiUrl}/task/${parameters.taskId}/subtasks`, body.toString(), { headers });
  }

  updateSubTask(parameters: { taskId: string; subTask: UpdateSubTask }) {
    const body = new HttpParams()
      .set('Id', parameters.subTask.id)
      .set('Name', parameters.subTask.name)
      .set('IsCompleted', parameters.subTask.isCompleted.toString());

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.put(
      `${this.apiUrl}/task/${parameters.taskId}/subtasks/${parameters.subTask.id}`,
      body.toString(),
      { headers },
    );
  }

  deleteSubTask(parameters: { taskId: string; subTaskId: string }) {
    return this.http.delete(
      `${this.apiUrl}/task/${parameters.taskId}/subtasks/${parameters.subTaskId}`,
    );
  }

  replaceSubTasks(parameters: { taskId: string; subTasks: CreateSubTask[] }) {
    return this.http.put(
      `${this.apiUrl}/task/${parameters.taskId}/subtasks`,
      parameters.subTasks,
    );
  }

  addToGoogleCalendar(parameters: { taskId: string }) {
    return this.http.post(`${this.apiUrl}/task/${parameters.taskId}/calendar`, null);
  }

  removeFromGoogleCalendar(parameters: { taskId: string }) {
    return this.http.delete(`${this.apiUrl}/task/${parameters.taskId}/calendar`);
  }

  toggleTaskCompletion(task: Task): void {
    task.isCompleted = !task.isCompleted;
    this.update({ id: task.id, task: task }).subscribe(
      (response) => {
        console.log('Task updated successfully:', response);
      },
      (error) => {
        console.error('Error updating task:', error);
        task.isCompleted = !task.isCompleted;
      },
    );
  }
}
