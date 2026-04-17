import { Task } from "@/types/Task";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addingTask: boolean;
  deletingTask: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  markCompleted: (taskId: string) => Promise<void>
}

// Ensure the default empty function matches the new Promise signature
const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const { user } = useAuth();

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      setAddingTask(true);
      await addDoc(collection(db, "tasks"), task);
      return true;
    } catch (error) {
      console.error("Error adding task: ", error);
      // Optional: throw error here if you want your UI to catch it and show a toast alert!
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

  const markCompleted = async (taskId: string) => {
    try {
      setMarkingCompleted(true);
      const docRef = doc(db, "tasks", taskId);
      const thisTask = tasks.find(task => task.id === taskId);

      if(thisTask) await setDoc(docRef, { ...thisTask, completed: true });
      else {
        throw new Error(`No task found matching id: ${taskId}`);
      }
    } catch(error) {
      console.error("Error marking task complete", `taskId ${taskId}`, error);
    } finally {
      setMarkingCompleted(false);
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
    <TasksContext.Provider value={{ tasks, loading, addingTask, deletingTask, addTask, deleteTask, markCompleted }}>
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