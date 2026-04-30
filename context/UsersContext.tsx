import { User } from "@/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UsersContextTypes {
  users: User[];
  usersLoading: boolean;
}
const UsersContext = createContext<UsersContextTypes | undefined>(undefined);

export default function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if(!user) {
      setUsers([]);
      setUsersLoading(false);
      return;
    }

    const q = query(collection(db, "users"))
    const unsubscribe = onSnapshot(q, (snap) => {
      try {
        const usersData = snap.docs.map((docData) => (
          {
            id: docData.id,
            ...docData.data()
          } 
        )) as User[]

        setUsers(usersData);
      } catch (error) {
        console.error("Error getting users data", error);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    });

    return unsubscribe;
  }, [user])

  return (
    <UsersContext.Provider value={{ users, usersLoading: usersLoading }}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => {
  const context = useContext(UsersContext);
  if(!context) throw new Error("useUsers must be used within a UsersProvider");
  return context;
}