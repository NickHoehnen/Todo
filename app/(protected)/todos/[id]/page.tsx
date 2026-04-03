'use client'

import { Todo } from "@/types/todo"
import { Typography, CircularProgress, Box } from "@mui/material"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState, use } from "react"
import { db } from "@/lib/firebase"

interface TodosPageProps {
  // In Next 16, params and searchParams remain Promises 
  // that must be unwrapped with 'use()'
  params: Promise<{ id: string }>
}

export default function TodosPage({ params }: TodosPageProps) {
  const { id } = use(params); 
  
  const [todoData, setTodoData] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived Logic: Correcting the "Past Due" check for Next 16
  // Note: We check if it's NOT completed AND the date has passed.
  const isPastDue = todoData && !todoData.dateCompleted && todoData.dueDate.toDate() < new Date();

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
        console.error("Firestore Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) getTodoDoc();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!todoData) return <Typography variant="h6" sx={{ p: 4 }}>Task not found.</Typography>;

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {todoData.task}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        {todoData.dateCompleted ? (
          <Typography variant="overline" color="success.main" sx={{ fontSize: '1rem' }}>
            ✓ Status: Completed
          </Typography>
        ) : (
          <Typography variant="h6" color="text.secondary">
            Due: {todoData.dueDate.toDate().toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {isPastDue && (
        <Typography 
          color="error" 
          sx={{ 
            fontWeight: 'bold', 
            bgcolor: 'error.dark', 
            color: 'white', 
            p: 1, 
            borderRadius: 1,
            display: 'inline-block'
          }}
        >
          Overdue
        </Typography>
      )}
    </Box>
  );
}