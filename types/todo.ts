import { Timestamp } from "firebase/firestore";


export type Todo = {
  task: string,
  assignedTo: Array<string>,
  dueDate: Timestamp,
  dateCompleted: Timestamp | null,
}