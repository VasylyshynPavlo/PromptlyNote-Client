import { SubTask } from './sub-task';
import { TaskList } from './task-list';
import { Category } from './category';

export interface Task {
  id: string;
  name: string;
  dueDate: string | null;
  note: string;
  isCompleted: boolean;
  categoryId: string | null;
  category: Category | null;
  userId: string;
  taskListId: string;
  taskList: TaskList[] | null;
  subTasks: SubTask[];
  remindBeforeMinutes: number | null;
  syncToGoogleCalendar: boolean;
}
