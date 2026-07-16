import { Task } from "./task";

export interface TaskList {
  id: string;
  name: string;
  description: string;
  iconName: string;
  default: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
}
