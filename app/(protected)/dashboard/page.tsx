'use client'

import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemAvatar, ListItemText, Stack, TextField, Typography, InputAdornment, ButtonBase, useMediaQuery } from "@mui/material";
import { collection, onSnapshot, query, where, addDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { Todo } from "@/types/todo";
import { onAuthStateChanged } from "firebase/auth";
import { Add, Clear, MoreHoriz, Person, Search } from "@mui/icons-material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";

export default function Dashboard() {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // --- Search Logic ---
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Local state for the input field
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");

  useEffect(() => {
    // Optimization: Don't sync if the state already matches the URL
    const currentQuery = searchParams.get('q') || "";
    if (searchTerm === currentQuery) return;

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set('q', searchTerm);
      } else {
        params.delete('q');
      }
      
      // scroll: false is vital for a smooth list experience
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, replace, searchParams]);

  // Filter the list based on the actual URL parameter
  const filteredTodos = todos.filter((todo) =>
    todo.task.toLowerCase().includes((searchParams.get('q') || "").toLowerCase())
  );

  // --- Form State ---
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDateString, setDueDateString] = useState("");

  useEffect(() => {
    let unsubscribeSnap: () => void;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnap) unsubscribeSnap();

      if (user) {
        const q = query(
          collection(db, "todos"), 
          where("assignedTo", "array-contains", user.uid)
        );

        unsubscribeSnap = onSnapshot(q, (snapshot) => {
          const todosData = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          } as Todo));
          setTodos(todosData);
        }, (error) => {
          if (error.code !== 'permission-denied') {
            console.error("Firestore error:", error);
          }
        });
      } else {
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
      const dateValue = new Date(dueDateString);
      
      const newTodo: Omit<Todo, 'id'> = {
        task: taskTitle,
        assignedTo: [auth.currentUser.uid],
        dueDate: Timestamp.fromDate(dateValue),
        dateCompleted: null,
      };

      await addDoc(collection(db, "todos"), newTodo);
      setTaskTitle("");
      setDueDateString("");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding task: ", error);
    } finally {
      setAddingTask(false);
    }
  };

  return (
    <Box sx={{ p: {xs: 2, md: 5}, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" align="left" sx={{ mb: 4, width: '100%', fontWeight: 'bold' }}>Todo:</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 4, width: { xs: '100%', md: '80%' } }}>
        <TextField
          fullWidth
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button 
          variant="contained" 
          onClick={() => setDialogOpen(true)} 
          sx={{ px: 3, whiteSpace: 'nowrap', minWidth: isMobile ? '56px' : 'auto' }}
        >
          <Add sx={{ mr: isMobile ? 0 : 1 }} />
          {!isMobile && "Create Task"}
        </Button>
      </Stack>

      {/* Todos list */}
      <Stack spacing={2} sx={{ width: { xs: '100%', md: '80%' }}}>
        {filteredTodos.map((todo) => (
          <ListItem 
            key={todo.id} 
            sx={{ 
              p: 2, 
              width: '100%',
              border: 1,
              borderRadius: 2,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:hover': { borderColor: 'primary.main' }
            }}
            secondaryAction={
              <IconButton><MoreHoriz /></IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.light' }}><Person /></Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={todo.task} 
              secondary={todo.dueDate.toDate()?.toDateString()} 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
        ))}
        {filteredTodos.length === 0 && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? `No tasks match "${searchTerm}"` : "No tasks assigned to you yet."}
            </Typography>
          </Box>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add New Task</DialogTitle>
        <Box component="form" onSubmit={handleAddTask}>
          <DialogContent>
            <Stack spacing={3}>
              <TextField 
                fullWidth
                label="Task Description" 
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                variant="outlined"
                required
                autoFocus
              />
              <TextField 
                fullWidth
                type="date"
                label="Due Date" 
                value={dueDateString}
                onChange={(e) => setDueDateString(e.target.value)}
                variant="outlined"
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button disabled={addingTask} type="submit" variant="contained">
              {addingTask ? "Saving..." : "Save Task"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}