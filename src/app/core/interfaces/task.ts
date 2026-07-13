import { SubTask } from './sub-task';
import { TaskList } from './task-list';

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  note: string;
  isCompleted: boolean;
  categoryId: string | null;
  category: null;
  userId: string;
  taskListId: string;
  taskList: TaskList[] | null;
  subTasks: SubTask[];
  remindBeforeMinutes: number | null;
  syncToGoogleCalendar: boolean;
}
