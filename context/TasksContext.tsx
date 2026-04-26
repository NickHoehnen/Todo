import { Task } from "@/types/Task";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addingTask: boolean;
  deletingTask: boolean;
  markingComplete: boolean;
  markingIncomplete: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTask: (task: Task) => Promise<boolean>;
  markComplete: (taskId: string) => Promise<void>;
  markIncomplete: (taskId: string) => Promise<void>
}

// Ensure the default empty function matches the new Promise signature
const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [markingIncomplete, setMarkingIncomplete] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      setAddingTask(true);
      await addDoc(collection(db, "tasks"), task);
      return true;
    } catch (error) {
      console.error("Error adding task", task, error);
      return false;
    } finally {
      setAddingTask(false);
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      setDeletingTask(true);
      const docRef = doc(db, "tasks", taskId);
      await deleteDoc(docRef);
      return true;
    } catch(error) {
      console.error("Error deleting task", "Task ID: " + taskId, error);
      return false;
    } finally {
      setDeletingTask(false);
    }
  }

  const updateTask = async (task: Task) => {
    try {
      setUpdating(true);
      const docRef = doc(db, "tasks", task.id);
      await updateDoc(docRef, task);
      return true;
    } catch(error) {
      console.error("Error updating task", "Task ID: " + task.id, error);
      return false;
    } finally {
      setUpdating(false);
    }
  }

  const markComplete = async (taskId: string) => {
    try {
      setMarkingComplete(true);
      const docRef = doc(db, "tasks", taskId);
      await updateDoc(docRef, { completed: true });
    } catch(error) {
      console.error("Error marking task complete", "Task ID: " + taskId, error);
    } finally {
      setMarkingComplete(false);
    }
  }

  const markIncomplete = async (taskId: string) => {
    try {
      setMarkingIncomplete(true);
      const docRef = doc(db, "tasks", taskId);
      await updateDoc(docRef, { completed: false });
    } catch(error) {
      console.error("Error marking task incomplete", `taskId ${taskId}`, error);
    } finally {
      setMarkingIncomplete(false);
    }
  }

  useEffect(() => {
    if(!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("assignedTo", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Notice setLoading(true) is gone from here!
      const tasksData = snapshot.docs.map((docData) => {
        return {
          id: docData.id,
          ...docData.data()
        }
      }) as Task[];

      setTasks(tasksData);
      setLoading(false); // Turns off the initial loader once data arrives
    }, (error) => {
      if(error.code !== "permission-denied") console.error(error);
      setLoading(false); // Prevents an infinite spinner if there's a database error
    });

    return unsubscribe;
  }, [user]);

  return (
    <TasksContext.Provider value={{ tasks, loading, addingTask, deletingTask, markingComplete, markingIncomplete, addTask, deleteTask, updateTask, markComplete, markIncomplete }}>
      {children}
    </TasksContext.Provider>
  );
}

// Grab the context, first checking if it exists/ has been initialized
export const useTasks = () => {
  const context = useContext(TasksContext);
  if(!context) throw new Error("useTasks must be used within a TasksProvider");
  return context;
}