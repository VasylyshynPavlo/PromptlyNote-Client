export interface UpdateTask {
  name: string;
  note: string;
  dueDate: string | null;
  categoryId: string | null;
  taskListId: string;
  isCompleted: boolean;
  subTasks: UpdateSubTask[];
}

export interface UpdateSubTask {
  id: string;
  name: string;
  isCompleted: boolean;
}
