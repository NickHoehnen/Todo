'use client'

import { Todo } from "@/types/todo"
import { Typography, CircularProgress, Box } from "@mui/material"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState, use } from "react" // 1. Import 'use'
import { db } from "@/lib/firebase"

interface TodosPageProps {
  params: Promise<{ id: string }>
}

export default function TodosPage({ params }: TodosPageProps) {
  const { id } = use(params); 
  
  const [todoData, setTodoData] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTodoDoc = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "todos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTodoData({ id: docSnap.id, ...docSnap.data() } as Todo);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) getTodoDoc();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center'}}><CircularProgress /></Box>
  )
  if (!todoData) return <Typography>Not found</Typography>;

  return (
    <Box>
      <Typography>{todoData.task}</Typography>
      <Typography>{todoData.dueDate.toDate().toDateString()}</Typography>
    </Box>
  );
}