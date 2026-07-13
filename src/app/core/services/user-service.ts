import { HttpClient } from "@angular/common/http";
import { inject, Service } from '@angular/core';
import { environment } from "../../../environments/environment";

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  me(parameters: { includeTaskLists: boolean; includeTasks: boolean; includeCategories: boolean }) {
    let queryParams = `includeTaskLists=${parameters.includeTaskLists}`;
    queryParams += `&includeTasks=${parameters.includeTasks}`;
    queryParams += `&includeCategories=${parameters.includeCategories}`;
    return this.http.get(`${this.apiUrl}/user?${queryParams}`);
  }

  updateFullName(parameters: { fullName: string }) {
    return this.http.put(`${this.apiUrl}/user?fullName=${parameters.fullName}`, {});
  }

  deleteMe() {
    return this.http.delete(`${this.apiUrl}/user`);
  }
}
