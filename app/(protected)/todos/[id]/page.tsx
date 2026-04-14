'use client'

import { Todo } from "@/types/todo"
import { Typography, CircularProgress, Box } from "@mui/material"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState, use, useMemo } from "react"
import { db } from "@/lib/firebase"
import { useTodos } from "@/context/TodosContext"

interface TodosPageProps {
  params: Promise<{ id: string }>
}

export default function TodosPage({ params }: TodosPageProps) {
  const { id } = use(params); 
  const { todos, loading } = useTodos();
  const todoData = useMemo(() => todos.find(todo => todo.id === id), [todos]);

  // Past due if the date is before now AND it's not completed
  const isPastDue = useMemo(() => {
    if(!todoData) return false;
    !todoData.dateCompleted && new Date() > todoData.dueDate.toDate();
  }, [todoData])

  

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