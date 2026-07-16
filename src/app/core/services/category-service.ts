import { inject, Service, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Category } from '../interfaces/category';
import { DataDetails } from '../interfaces/data-details';
import { RequestCallbacks } from '../interfaces/request-callbacks';

export interface CategoryQuery {
  page: number;
  pageSize: number;
  sortBy: number;
  isDescending: boolean;
}

const DEFAULT_QUERY: CategoryQuery = { page: 0, pageSize: 100, sortBy: 0, isDescending: false };

@Service()
export class CategoryService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  readonly loading = signal(false);
  readonly categories = signal<DataDetails<Category>>({ data: [], count: 0, currentPage: 0, totalPages: 0 });

  private loaded = false;

  get(parameters: { id: string }) {
    return this.http.get(`${this.apiUrl}/category/${parameters.id}`);
  }

  list(parameters: CategoryQuery = DEFAULT_QUERY, force = false) {
    if (this.loaded && !force) {
      return;
    }
    this.loading.set(true);

    let queryParams = `page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    queryParams += `&sortBy=${parameters.sortBy}`;
    queryParams += `&isDescending=${parameters.isDescending}`;
    return this.http.get(`${this.apiUrl}/category?${queryParams}`).subscribe({
      next: (response: any) => {
        this.categories.set(response);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error fetching categories:', error);
      },
    });
  }

  create(parameters: { name: string; colorHex: string }, callbacks?: RequestCallbacks) {
    const body = new HttpParams()
      .set('Name', parameters.name)
      .set('ColorHex', parameters.colorHex);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.http
      .post(`${this.apiUrl}/category`, body.toString(), { headers })
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          this.reload();
          callbacks?.onSuccess?.();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  update(parameters: { id: string; name: string; colorHex: string }, callbacks?: RequestCallbacks) {
    const body = new HttpParams()
      .set('Name', parameters.name)
      .set('ColorHex', parameters.colorHex);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.http
      .put(`${this.apiUrl}/category/${parameters.id}`, body.toString(), { headers })
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          this.reload();
          callbacks?.onSuccess?.();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  delete(parameters: { id: string }, callbacks?: RequestCallbacks) {
    this.http
      .delete(`${this.apiUrl}/category/${parameters.id}`)
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: () => {
          this.reload();
          callbacks?.onSuccess?.();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          callbacks?.onError?.(error);
        },
      });
  }

  search(parameters: { term: string; page: number; pageSize: number; }) {
    let queryParams = `term=${encodeURIComponent(parameters.term)}`;
    queryParams += `&page=${parameters.page}`;
    queryParams += `&pageSize=${parameters.pageSize}`;
    return this.http.get(`${this.apiUrl}/category/search?${queryParams}`);
  }

  reload(parameters: CategoryQuery = DEFAULT_QUERY): void {
    this.list(parameters, true);
  }
}
