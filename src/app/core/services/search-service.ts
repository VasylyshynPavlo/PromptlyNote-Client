import { inject, Service, signal, WritableSignal } from '@angular/core';
import { catchError, concat, finalize, of, Subscription, tap } from 'rxjs';
import { Task } from '../interfaces/task';
import { TaskList } from '../interfaces/task-list';
import { Category } from '../interfaces/category';
import { DataDetails } from '../interfaces/data-details';
import { TaskSerivce } from './task-serivce';
import { TaskListService } from './task-list-service';
import { CategoryService } from './category-service';

export const MIN_SEARCH_LENGTH = 3;

const PAGE_SIZE = 20;

function empty<T>(): DataDetails<T> {
  return { data: [], count: 0, currentPage: 0, totalPages: 0 };
}

@Service()
export class SearchService {
  private readonly taskService = inject(TaskSerivce);
  private readonly taskListService = inject(TaskListService);
  private readonly categoryService = inject(CategoryService);

  readonly loading = signal(false);
  readonly tasks = signal<DataDetails<Task>>(empty<Task>());
  readonly taskLists = signal<DataDetails<TaskList>>(empty<TaskList>());
  readonly categories = signal<DataDetails<Category>>(empty<Category>());

  private running: Subscription | null = null;

  search(term: string): void {
    const value = term.trim();
    this.running?.unsubscribe();

    if (value.length < MIN_SEARCH_LENGTH) {
      this.clear();
      return;
    }

    const parameters = { term: value, page: 0, pageSize: PAGE_SIZE };
    this.loading.set(true);

    this.running = concat(
      this.taskService.search(parameters).pipe(
        tap((response) => this.tasks.set(response)),
        catchError((error) => this.recover(error, 'tasks', this.tasks)),
      ),
      this.taskListService.search(parameters).pipe(
        tap((response) => this.taskLists.set(response)),
        catchError((error) => this.recover(error, 'task lists', this.taskLists)),
      ),
      this.categoryService.search(parameters).pipe(
        tap((response) => this.categories.set(response)),
        catchError((error) => this.recover(error, 'categories', this.categories)),
      ),
    )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe();
  }

  clear(): void {
    this.running?.unsubscribe();
    this.running = null;
    this.loading.set(false);
    this.tasks.set(empty<Task>());
    this.taskLists.set(empty<TaskList>());
    this.categories.set(empty<Category>());
  }

  private recover<T>(error: unknown, what: string, target: WritableSignal<DataDetails<T>>) {
    console.error(`Error searching ${what}:`, error);
    target.set(empty<T>());
    return of(empty<T>());
  }
}
