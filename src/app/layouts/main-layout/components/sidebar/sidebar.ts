import { Component, inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  imports: [IconPipe, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  readonly taskListService = inject(TaskListService);

  ngOnInit(): void {
    this.taskListService.list();
  }
}
