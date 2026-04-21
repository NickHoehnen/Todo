'use client'

import { Typography, CircularProgress, Box } from "@mui/material"
import { use, useMemo } from "react"
import { useTasks } from "@/context/TasksContext"

interface TodosPageProps {
  params: Promise<{ id: string }>
}

export default function TodosPage({ params }: TodosPageProps) {
  const { id } = use(params); 
  const { tasks, loading } = useTasks();

  const badgeSx = {
    color: 'black',
    px: 1.5,
    py: 0.5,
    borderRadius: '16px',
    display: 'inline-block',
    mr: 1,
    verticalAlign: 'middle',
    fontWeight: 'bold', // Consistent across all badges
  };
  
  const todoData = useMemo(() => tasks.find(task => task.id === id), [tasks, id]);

  // FIX 1: Added explicit return and fixed logic
  const isPastDue = useMemo(() => {
    if (!todoData || todoData.completed) return false;
    
    // Check if the due date is in the past
    return new Date() > todoData.dueDate.toDate();
  }, [todoData]);

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
        {todoData.completed ? (
          <Typography variant="overline" sx={{ ...badgeSx, bgcolor: 'success.main' }}>
            Completed
          </Typography>
        ) : (
          <>
            {isPastDue && (
              <Typography variant="overline" sx={{ ...badgeSx, bgcolor: 'error.main' }}>
                Overdue
              </Typography>
            )}
            <Typography 
              variant="h6" 
              color="text.secondary" 
              component="span" 
              sx={{ verticalAlign: 'middle' }}
            >
              Due: {todoData.dueDate.toDate().toLocaleDateString()}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}