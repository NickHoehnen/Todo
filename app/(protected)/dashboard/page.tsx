'use client'

import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { collection, onSnapshot, query, where, addDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { Todo } from "@/types/todo";
import { onAuthStateChanged } from "firebase/auth";
import { Delete, MoreHoriz, Person } from "@mui/icons-material";

export default function Dashboard() {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  
  // Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDateString, setDueDateString] = useState("");

  useEffect(() => {
    let unsubscribeSnap: () => void;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      // 1. If there's an existing Firestore listener from a previous user, kill it
      if (unsubscribeSnap) {
        unsubscribeSnap();
      }

      if (user) {
        const q = query(
          collection(db, "todos"), 
          where("assignedTo", "array-contains", user.uid)
        );

        // 2. Assign the listener to our variable so we can clean it up later
        unsubscribeSnap = onSnapshot(q, (snapshot) => {
          const todosData = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id, // Good practice to keep the doc ID
          } as Todo));
          setTodos(todosData);
        }, (error) => {
          // 3. Gracefully handle the permission error during logout
          if (error.code === 'permission-denied') {
            console.warn("Firestore listener silenced during logout.");
          } else {
            console.error("Firestore error:", error);
          }
        });
      } else {
        // 4. If user logged out, clear the local state
        setTodos([]);
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeSnap) unsubscribeSnap();
    };
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !taskTitle || !dueDateString) return;

    try {
      setAddingTask(true);
      // Convert the HTML date string (YYYY-MM-DD) to a Firestore Timestamp
      const dateValue = new Date(dueDateString);
      
      // Create the new todo doc. Let firebase create the id
      const newTodo: Omit<Todo, 'id'> = {
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

      <Stack spacing={2} sx={{ width: { xs: '100%', md: '80%' }}}>
        {todos.map((todo, i) => (
          <ListItem 
            key={i} sx={{ 
              p: 2, 
              width: '100%',
              border: 2,
              borderRadius: 2,
              borderColor: 'divider'
            }}
            secondaryAction={
              <IconButton><MoreHoriz /></IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar>
                <Person />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={todo.task} secondary={todo.dueDate.toDate().toDateString()} />
          </ListItem>
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
                variant="standard"
                required
              />
              <TextField 
                fullWidth
                type="date"
                label="Due Date" 
                value={dueDateString}
                onChange={(e) => setDueDateString(e.target.value)}
                variant="standard"
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