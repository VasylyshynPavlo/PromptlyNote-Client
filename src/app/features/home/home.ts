import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TaskListService } from '../../core/services/task-list-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
})
export class Home {
  private readonly taskListService = inject(TaskListService);
  private readonly router = inject(Router);

  constructor() {
    this.taskListService.list();

    effect(() => {
      const lists = this.taskListService.taskLists();
      if (lists.length > 0) {
        // replaceUrl: щоб "назад" не повертав на / і не редіректив по колу
        this.router.navigate(['/lists', lists[0].id], { replaceUrl: true });
      }
    });
  }
}
