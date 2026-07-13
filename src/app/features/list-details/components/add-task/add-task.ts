import { Component, input } from '@angular/core';

@Component({
  selector: 'app-add-task',
  imports: [],
  templateUrl: './add-task.html',
})
export class AddTask {
  taskListId = input<string>('taskListId');
}
