export interface CreateTask {
  name: string;
  note: string;
  dueDate: string | null;
  categoryId: string | null;
  taskListId: string;
  subTasks: CreateSubTask[];
}

export interface CreateSubTask {
  name: string;
  isCompleted: boolean;
}
