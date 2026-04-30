import { Task } from "@/types/Task";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addingTask: boolean;
  deletingTask: boolean;
  markingComplete: boolean;
  markingIncomplete: boolean;
  assigningUser: boolean;
  addTask: (task: Omit<Task, 'id'>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTask: (task: Task) => Promise<boolean>;
  assignUser: (task: Task, user: User) => Promise<void>; // FIX 2: Added to interface
  markComplete: (taskId: string) => Promise<void>;
  markIncomplete: (taskId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [markingIncomplete, setMarkingIncomplete] = useState(false);
  const [assigningUser, setAssigningUser] = useState(false);
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
      
      const { id, ...taskData } = task;
      const docRef = doc(db, "tasks", id);
      
      await updateDoc(docRef, taskData);
      
      return true;
    } catch(error) {
      console.error(`Error updating task. Task ID: ${task.id}`, error);
      return false;
    } finally {
      setUpdating(false);
    }
  }

  const assignUser = async (task: Task, user: User) => {
    try {
      setAssigningUser(true);
      const taskDoc = tasks.find((thisTask) => thisTask.id === task.id);

      if (!taskDoc) {
        throw new Error("Task not found");
      }

      const assignedTo = taskDoc.assignedTo || [];

      if (assignedTo.includes(user.id)) {
        console.warn("User is already assigned to this task.");
        return; 
      }

      const updatedAssignedTo = [...assignedTo, user.id];

      // FIX 1: Spread the task FIRST, then overwrite the assignedTo property
      await updateTask({ ...task, assignedTo: updatedAssignedTo });

    } catch (error) {
      console.error(error); 
      throw new Error(`Error assigning user ${user.id} to task ${task.id}`);
    } finally {
      setAssigningUser(false);
    }
  };

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
      const tasksData = snapshot.docs.map((docData) => {
        return {
          id: docData.id,
          ...docData.data()
        }
      }) as Task[];

      setTasks(tasksData);
      setLoading(false); 
    }, (error) => {
      if(error.code !== "permission-denied") console.error(error);
      setLoading(false); 
    });

    return unsubscribe;
  }, [user]);

  return (
    // FIX 3: Added `assignUser` to the value object
    <TasksContext.Provider value={{ tasks, loading, addingTask, deletingTask, markingComplete, markingIncomplete, assigningUser, addTask, deleteTask, updateTask, assignUser, markComplete, markIncomplete }}>
      {children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TasksContext);
  if(!context) throw new Error("useTasks must be used within a TasksProvider");
  return context;
}