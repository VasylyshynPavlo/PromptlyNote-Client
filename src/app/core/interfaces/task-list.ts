import { Task } from "./task";

export interface TaskList {
  id: string;
  name: string;
  description: string;
  iconName: string;
  default: boolean;
  userId: number;
  tasks: Task[] | null;
  createdAt: string;
  updatedAt: string;
}
