'use client'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { collection, onSnapshot, query, where, addDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { Todo } from "@/types/todo";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  
  // Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDateString, setDueDateString] = useState("");

  useEffect(() => {
    // Listen for auth state to handle page refreshes correctly
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collection(db, "todos"), 
        where("assignedTo", "array-contains", user.uid)
      );

      const unsubscribeSnap = onSnapshot(q, (snapshot) => {
        const todosData = snapshot.docs.map((doc) => ({
          ...doc.data(),
        } as Todo));
        setTodos(todosData);
      });

      return () => unsubscribeSnap();
    });

    return () => authUnsubscribe();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !taskTitle || !dueDateString) return;

    try {
      setAddingTask(true);
      // Convert the HTML date string (YYYY-MM-DD) to a Firestore Timestamp
      const dateValue = new Date(dueDateString);
      
      const newTodo: Todo = {
        task: taskTitle,
        assignedTo: [auth.currentUser.uid],
        dueDate: Timestamp.fromDate(dateValue),
        dateCompleted: null, // Initial state
      };

      await addDoc(collection(db, "todos"), newTodo);
      
      // Reset form
      setTaskTitle("");
      setDueDateString("");
      setDialogOpen(false); // Here so it only closes on success
    } catch (error) {
      console.error("Error adding task: ", error);
    } finally {
      setAddingTask(false);
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>My Dashboard</Typography>
      
      <Button variant="contained" onClick={() => setDialogOpen(true)} sx={{ mb: 4 }}>
        Create Task
      </Button>

      <Stack spacing={2}>
        {todos.map((todo, i) => (
          <Box key={i} sx={{ p: 2, border: '1px solid #ccc', width: '22rem', borderRadius: '8px' }}>
            <Typography variant="h6">{todo.task}</Typography>
            <Typography variant="body2" color="text.secondary">
              Due: {todo.dueDate.toDate().toLocaleDateString()}
            </Typography>
            {todo.dateCompleted && (
              <Typography variant="caption" color="success.main">
                Completed: {todo.dateCompleted.toDate().toLocaleDateString()}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>

      <Dialog open={dialogOpen}>
        <DialogTitle>Add New Task</DialogTitle>
        <Box component="form" onSubmit={handleAddTask} sx={{ p: 1 }}>
          <DialogContent>
            <Stack spacing={3}>
              <TextField 
                fullWidth
                label="Task Description" 
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
              <TextField 
                fullWidth
                type="date"
                label="Due Date" 
                InputLabelProps={{ shrink: true }}
                value={dueDateString}
                onChange={(e) => setDueDateString(e.target.value)}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button loading={addingTask} type="submit" variant="contained">Save Task</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}