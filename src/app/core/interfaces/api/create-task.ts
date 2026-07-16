export interface CreateTask {
  name: string;
  note: string;
  dueDate: string | null;
  categoryId: string | null;
  taskListId: string;
  subTasks: CreateSubTask[];
  remindBeforeMinutes: number | null;
  syncToGoogleCalendar: boolean;
}

export interface CreateSubTask {
  name: string;
  isCompleted: boolean;
}
