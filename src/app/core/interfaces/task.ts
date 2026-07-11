import { SubTask } from "./sub-task";
import { TaskList } from "./task-list";

export interface Task {
  id: number;
  name: string;
  dueDate: string;
  isCompleted: boolean;
  categoryId: string | null;
  category: null;
  userId: string;
  taskListId: string;
  taskList: TaskList[] | null;
  subTasks: SubTask[];
}
