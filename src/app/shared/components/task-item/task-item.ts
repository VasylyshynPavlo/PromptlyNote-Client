import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../../core/interfaces/task';
import { CreateSubTask } from '../../../core/interfaces/api/create-task';
import { Category } from '../../../core/interfaces/category';
import { TaskSerivce } from '../../../core/services/task-serivce';
import { TaskListService } from '../../../core/services/task-list-service';
import { UserService } from '../../../core/services/user-service';
import { DatePicker } from '../date-picker/date-picker';
import { ReminderPicker } from '../reminder-picker/reminder-picker';
import { StepsPicker } from '../steps-picker/steps-picker';
import { NotePicker } from '../note-picker/note-picker';
import { CategoryPicker } from '../category-picker/category-picker';

@Component({
  selector: 'app-task-item',
  imports: [DatePicker, ReminderPicker, StepsPicker, NotePicker, CategoryPicker],
  templateUrl: './task-item.html',
  host: { class: 'block' },
})
export class TaskItem {
  private taskService = inject(TaskSerivce);
  private taskListService = inject(TaskListService);
  userService = inject(UserService);

  task = input.required<Task>();
  taskChange = output<Task>();
  taskDeleted = output<string>();

  pending = signal(false);

  editingName = signal(false);
  nameDraft = signal('');
  nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  constructor() {
    effect(() => {
      if (this.editingName()) {
        this.nameInput()?.nativeElement.focus();
      }
    });
  }

  toggleCompletion() {
    const updated: Task = { ...this.task(), isCompleted: !this.task().isCompleted };
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  toggleGoogleCalendar() {
    const task = this.task();
    const action$ = task.syncToGoogleCalendar
      ? this.taskService.removeFromGoogleCalendar({ taskId: task.id })
      : this.taskService.addToGoogleCalendar({ taskId: task.id });
    this.runMutation(action$);
  }

  startEditName() {
    if (this.pending()) return;
    this.nameDraft.set(this.task().name);
    this.editingName.set(true);
  }

  cancelEditName() {
    this.editingName.set(false);
  }

  saveName() {
    if (!this.editingName()) return;
    this.editingName.set(false);
    const name = this.nameDraft().trim();
    if (!name || name === this.task().name) return;
    const updated: Task = { ...this.task(), name };
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  toggleSubTaskCompletion(index: number) {
    const subTasks: CreateSubTask[] = this.task().subTasks.map((s, i) => ({
      name: s.name,
      isCompleted: i === index ? !s.isCompleted : s.isCompleted,
    }));
    this.runMutation(this.taskService.replaceSubTasks({ taskId: this.task().id, subTasks }));
  }

  onDueChanged(dueDate: string | null) {
    const updated: Task = { ...this.task(), dueDate };
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  onReminderChanged(remindBeforeMinutes: number | null) {
    const updated: Task = { ...this.task(), remindBeforeMinutes };
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  onStepsChanged(subTasks: CreateSubTask[]) {
    this.runMutation(this.taskService.replaceSubTasks({ taskId: this.task().id, subTasks }));
  }

  onNoteChanged(note: string) {
    if (note === (this.task().note ?? '')) return;
    const updated: Task = { ...this.task(), note };
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  onCategoryChanged(category: Category | null) {
    const categoryId = category?.id ?? null;
    if (categoryId === this.task().categoryId) return;
    const updated: Task = { ...this.task(), categoryId };
    this.runMutation(this.taskService.update({ id: updated.id, task: updated }));
  }

  deleteTask() {
    if (this.pending()) return;
    const taskId = this.task().id;
    this.pending.set(true);
    this.taskService.delete(
      { id: taskId },
      {
        onSuccess: () => this.taskDeleted.emit(taskId),
        onSettled: () => this.pending.set(false),
      },
    );
  }

  private runMutation(mutation$: Observable<unknown>) {
    if (this.pending()) return;
    this.pending.set(true);
    this.taskService.mutateAndReload(
      mutation$,
      {
        id: this.task().id,
        includeCategory: true,
        includeTaskList: false,
        includeSubTasks: true,
      },
      {
        onSuccess: (task) => this.taskChange.emit(task),
        onSettled: () => this.pending.set(false),
      },
    );
  }
}
