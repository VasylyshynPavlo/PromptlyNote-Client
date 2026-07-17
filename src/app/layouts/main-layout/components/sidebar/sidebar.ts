import { Component, inject, OnInit, Pipe, PipeTransform, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TaskListService } from '../../../../core/services/task-list-service';
import { IconPicker } from '../icon-picker/icon-picker';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconPicker],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  readonly taskListService = inject(TaskListService);
  private readonly router = inject(Router);

  newListIcon = signal<string>('check_box');
  newListName = signal<string>('');
  newListDescription = signal<string>('');

  addList(event: Event) {
    event.preventDefault();
    const name = this.newListName().trim();
    const description = this.newListDescription().trim();
    if (!name || !description) return;

    this.taskListService.create(
      { name, description, iconName: this.newListIcon() },
      {
        onSuccess: () => {
          this.newListName.set('');
          this.newListDescription.set('');
          this.newListIcon.set('check_box');
        },
      },
    );
  }

  deleteList(listId: string) {
    this.taskListService.delete({ id: listId }).subscribe({
      next: () => {
        this.taskListService.reload();
      },
      error: (error) => {
        console.error('Error deleting task list:', error);
      },
    });
  }

  ngOnInit(): void {
    this.taskListService.list(
      { page: 0, pageSize: 100, sortBy: 1, isDescending: true },
    );
  }
}
