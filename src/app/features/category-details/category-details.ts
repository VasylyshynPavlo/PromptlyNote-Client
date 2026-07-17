import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Category } from '../../core/interfaces/category';
import { Task } from '../../core/interfaces/task';
import { CategoryService } from '../../core/services/category-service';
import { TaskItem } from '../../shared/components/task-item/task-item';
import { Pagination } from '../../shared/components/pagination/pagination';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-category-details',
  imports: [TaskItem, Pagination],
  templateUrl: './category-details.html',
  host: { class: 'block h-full min-h-0' },
})
export class CategoryDetails {
  private readonly categoryService = inject(CategoryService);

  readonly id = input.required<string>();

  readonly category = signal<Category | null>(null);
  readonly tasks = signal<Task[] | null>(null);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.page.set(0);
        this.load(id, 0);
      });
    });
  }

  reload(): void {
    this.load(this.id(), this.page());
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.load(this.id(), page);
  }

  replaceTask(updated: Task): void {
    if (updated.categoryId !== this.id()) {
      this.removeTask(updated.id);
      return;
    }
    this.tasks.update((tasks) =>
      tasks ? tasks.map((task) => (task.id === updated.id ? updated : task)) : tasks,
    );
  }

  removeTask(taskId: string): void {
    this.tasks.update((tasks) => (tasks ? tasks.filter((task) => task.id !== taskId) : tasks));
    this.reload();
  }

  private load(id: string, page: number): void {
    this.loading.set(true);
    this.categoryService.getWithTasks(
      { id, page, pageSize: PAGE_SIZE },
      {
        onSuccess: ({ category, tasks }) => {
          if (page > 0 && page >= tasks.totalPages) {
            this.goToPage(Math.max(tasks.totalPages - 1, 0));
            return;
          }
          this.category.set(category);
          this.tasks.set(tasks.data);
          this.totalPages.set(tasks.totalPages);
        },
        onError: () => {
          this.category.set(null);
          this.tasks.set(null);
          this.totalPages.set(0);
        },
        onSettled: () => this.loading.set(false),
      },
    );
  }
}
