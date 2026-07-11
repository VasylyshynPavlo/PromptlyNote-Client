import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Service()
export class CategoryApi {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  get(parameters: { id: string; includeTasks: boolean }) {
    let queryParams = `id=${parameters.id}`;
    queryParams += `&includeTasks=${parameters.includeTasks}`;
    return this.http.get(`${this.apiUrl}/categories/get?${queryParams}`);
  }

  list(parameters: { page: number; pageSize: number; sortBy: number; includeTasks: boolean }) {
    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&includeTasks=${parameters.includeTasks}`;
    return this.http.get(`${this.apiUrl}/categories/List?${queryParams}`);
  }

  create(parameters: { name: string; colorHex: string }) {
    const body = new HttpParams()
      .set('Name', parameters.name)
      .set('ColorHex', parameters.colorHex);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/categories/create`, body.toString(), { headers });
  }

  delete (parameters: { id: string }) {
    return this.http.delete(`${this.apiUrl}/categories/delete?id=${parameters.id}`);
  }
}
