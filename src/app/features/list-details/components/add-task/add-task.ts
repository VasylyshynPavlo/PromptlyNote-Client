import { Component, inject, input, output, signal } from '@angular/core';
import { CreateTask, CreateSubTask } from '../../../../core/interfaces/api/create-task';
import { Category } from '../../../../core/interfaces/category';
import { TaskSerivce } from '../../../../core/services/task-serivce';
import { DatePicker } from '../date-picker/date-picker';
import { ReminderPicker } from '../reminder-picker/reminder-picker';
import { StepsPicker } from '../steps-picker/steps-picker';
import { NotePicker } from '../note-picker/note-picker';
import { CategoryPicker } from '../category-picker/category-picker';
import { UserService } from '../../../../core/services/user-service';

@Component({
  selector: 'app-add-task',
  imports: [DatePicker, ReminderPicker, StepsPicker, NotePicker, CategoryPicker],
  templateUrl: './add-task.html',
})
export class AddTask {
  private taskService = inject(TaskSerivce);
  userService = inject(UserService);

  taskListId = input<string>('');
  taskCreated = output<void>();

  pending = signal(false);

  name = signal('');
  dueDate = signal<string | null>(null);
  reminder = signal<number | null>(null);
  syncToGoogle = signal(false);
  steps = signal<CreateSubTask[]>([]);
  note = signal('');
  category = signal<Category | null>(null);

  onReminderChanged(minutes: number | null) {
    this.reminder.set(minutes);
    if (minutes !== null && minutes > 0) {
      this.syncToGoogle.set(true);
      if (this.dueDate() === null) {
        const date = new Date();
        date.setHours(23, 59, 59, 999);
        this.dueDate.set(date.toISOString());
      }
    } else {
      this.syncToGoogle.set(false);
    }
  }

  toggleSyncToGoogle() {
    this.syncToGoogle.update((v) => !v);
    if (!this.syncToGoogle()) {
      this.reminder.set(null);
    } else if (this.dueDate() === null) {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      this.dueDate.set(date.toISOString());
    }
  }

  addTask() {
    const name = this.name().trim();
    if (!name || this.pending()) return;

    if(!this.userService.user()?.googleCalendar) {
      this.syncToGoogle.set(false);
      this.reminder.set(null);
    }

    const payload: CreateTask = {
      name,
      note: this.note().trim(),
      dueDate: this.dueDate(),
      categoryId: this.category()?.id ?? null,
      taskListId: this.taskListId(),
      subTasks: this.steps(),
      remindBeforeMinutes: this.reminder(),
      syncToGoogleCalendar: this.syncToGoogle(),
    };

    this.pending.set(true);
    this.taskService.create(payload, {
      onSuccess: () => {
        this.reset();
        this.taskCreated.emit();
      },
      onSettled: () => this.pending.set(false),
    });
  }

  private reset() {
    this.name.set('');
    this.dueDate.set(null);
    this.reminder.set(null);
    this.syncToGoogle.set(false);
    this.steps.set([]);
    this.note.set('');
    this.category.set(null);
  }
}
