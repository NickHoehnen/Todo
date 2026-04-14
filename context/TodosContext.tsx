import { Todo } from "@/types/todo";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TodosContextType {
  todos: Todo[];
  loading: boolean;
  addingTask: boolean;
  addTodo: (todo: Omit<Todo, 'id'>) => Promise<void>;
}

// Ensure the default empty function matches the new Promise signature
const TodosContext = createContext<TodosContextType>({ 
  todos: [], 
  loading: true, 
  addingTask: false, 
  addTodo: async () => {} 
});

export const TodosProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const { user } = useAuth();

  const addTodo = async (todo: Omit<Todo, 'id'>) => {
    try {
      setAddingTask(true);
      await addDoc(collection(db, "todos"), todo);
    } catch (error) {
      console.error("Error adding task: ", error);
      // Optional: throw error here if you want your UI to catch it and show a toast alert!
      throw error; 
    } finally {
      setAddingTask(false);
    }
  }

  useEffect(() => {
    if(!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "todos"),
      where("assignedTo", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Notice setLoading(true) is gone from here!
      const todosData = snapshot.docs.map((docData) => {
        return {
          id: docData.id,
          ...docData.data()
        }
      }) as Todo[];

      setTodos(todosData);
      setLoading(false); // Turns off the initial loader once data arrives
    }, (error) => {
      if(error.code !== "permission-denied") console.error(error);
      setLoading(false); // Prevents an infinite spinner if there's a database error
    });

    return unsubscribe;
  }, [user]);

  return (
    <TodosContext.Provider value={{ todos, loading, addingTask, addTodo }}>
      {children}
    </TodosContext.Provider>
  );
}

export const useTodos = () => useContext(TodosContext);