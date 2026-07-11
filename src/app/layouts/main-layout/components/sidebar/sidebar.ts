import { pipe } from "rxjs";
import { TaskList } from "./../../../../core/interfaces/task-list";
import { Component, inject, Pipe, PipeTransform, signal } from '@angular/core';
import { TaskListService } from '../../../../core/services/task-list-service';

const ICON_MAP: Record<string, string> = {
  lightbulb: 'lightbulb',
  start:     'rocket_launch',
  personal:  'person',
  'check-circle': 'check_circle',
  briefcase:  'work',
};

@Pipe({ name: 'icon' })
export class IconPipe implements PipeTransform {
  transform(apiIconName: string): string {
    return ICON_MAP[apiIconName] ?? 'checklist';
  }
}

@Component({
  selector: 'app-sidebar',
  imports: [IconPipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly taskListService = inject(TaskListService);

  taskList = signal<TaskList[]>([]);

  ngOnInit() {
    this.taskListService.list({page: 0, pageSize: 10, sortBy: 0, includeTasks: false});
  }
}