import { Timestamp } from "firebase/firestore";


export type Todo = {
  id: string,
  task: string,
  assignedTo: Array<string>,
  dueDate: Timestamp,
  dateCompleted: Timestamp | null,
  completed: boolean,
}