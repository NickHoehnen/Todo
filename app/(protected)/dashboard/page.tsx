'use client';

import { 
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  IconButton, Stack, TextField, Typography, InputAdornment, 
  useMediaQuery, Collapse, ButtonBase, CircularProgress, 
  Fade,
  Grow,
  Zoom,
  buttonBaseClasses
} from "@mui/material";
import { collection, onSnapshot, query, where, addDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { Todo } from "@/types/todo";
import { useAuth } from "@/context/AuthContext"; // Adjusted import path
import { Add, Clear, KeyboardArrowDown, Search } from "@mui/icons-material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import TodoListItem from "@/app/components/TodoListItem";
import { TransitionGroup } from 'react-transition-group';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // --- Navigation & Search ---
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");

  // --- Data State ---
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  
  // --- Form State ---
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDateString, setDueDateString] = useState("");

  const [todayStr, setTodayStr] = useState<string>("");
  const [datesOpen, setDatesOpen] = useState<Record<string, boolean>>({});

  const allDates = useMemo(() => {
    return todos.map(todo => todo.dueDate);
  }, [todos])

  const expandAll = () => {
    setDatesOpen(prev => {
      const dates = { ...prev };
      allDates.forEach(date => dates[date.toDate().toDateString()] = true);
      return dates
    });
  }
  const collapseAll = () => {
    setDatesOpen(prev => {
      const dates = { ...prev };
      allDates.forEach(date => dates[date.toDate().toDateString()] = false);
      return dates
    });
  }

  // Grab today's date on the client and expand today's todo list if exists
  useEffect(() => {
    const localToday = new Date().toDateString();
    setTodayStr(localToday);
    if(datesOpen[localToday] !== null) setDatesOpen(prev => ({ ...prev, [localToday]: true }));
  }, []);

  // URL Syncing Debounce
  useEffect(() => {
    const currentQuery = searchParams.get('q') || "";
    if(searchTerm === currentQuery) return;

    // Wait .3s after the search term
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) params.set('q', searchTerm);
      else params.delete('q');
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, replace, searchParams]);

  // Firestore data subscription
  useEffect(() => {
    if (!user) {
      setTodos([]);
      setDataLoading(false);
      return;
    }

    // Firestore query for todos assigned to current user
    const q = query(
      collection(db, "todos"), 
      where("assignedTo", "array-contains", user.uid)
    );

    // When change detected on query, update todos and loading states
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDataLoading(true);
      const todosData = snapshot.docs.map(todoDoc => {
        return {
          ...todoDoc.data(),
          id: todoDoc.id,
        } as Todo
      })
      setTodos(todosData);
      setDataLoading(false);
    }, (error) => {
      if(error.code != 'permission-denied') {
        console.error("Snapshot Error", error)
      }
    })

    return () => unsubscribe();
  }, [user]);

  // Sort todos by date
  const filteredTodosByDate = useMemo(() => {
    const queryTerm = searchTerm.toLowerCase();
    
    // Filter by search query and Sort
    const filtered = todos
      .filter(t => t.task.toLowerCase().includes(queryTerm))
      .sort((a, b) => a.dueDate.toDate().getTime() - b.dueDate.toDate().getTime());

    // Group by Date String
    const grouped: Record<string, Todo[]> = {};
    filtered.forEach(todo => {
      const dateKey = todo.dueDate.toDate().toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(todo);
    });

    return grouped;
  }, [todos, searchTerm]);

  const hasResults = Object.keys(filteredTodosByDate).length > 0;

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !taskTitle || !dueDateString) return;

    try {
      setAddingTask(true);
      const [year, month, day] = dueDateString.split('-').map(Number);
      const dateValue = new Date(year, month - 1, day);
      
      const newTodo: Omit<Todo, 'id'> = {
        task: taskTitle,
        assignedTo: [user.uid],
        dueDate: Timestamp.fromDate(dateValue),
        dateCompleted: null,
        completed: false,
      };

      await addDoc(collection(db, "todos"), newTodo);
      setTaskTitle("");
      setDueDateString("");
      setDialogOpen(false);
      setDatesOpen((prev) => ({
        ...prev,
        [dateValue.toDateString()]: true
      }))
    } catch (error) {
      console.error("Error adding task: ", error);
    } finally {
      setAddingTask(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, md: 5 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" align="left" sx={{ my: 1, width: '100%', fontWeight: 'bold' }}>
        Schedule
      </Typography>
      
      {/* Search Field and Add Button */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, width: { xs: '100%', md: '80%' } }}>
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
        <Box sx={{ display: 'flex', p: 0.5 }}>
          <Button 
            variant="contained" 
            onClick={() => setDialogOpen(true)} 
            sx={{ px: 3, whiteSpace: 'nowrap', minWidth: isMobile ? '56px' : 'auto' }}
          >
            <Add sx={{ mr: isMobile ? 0 : 1 }} />
            {!isMobile && "Create Task"}
          </Button>
        </Box>
      </Stack>

      <Stack direction="row-reverse" spacing={1} sx={{ width: '100%', display: 'flex', alignItems: 'end' }}>
          <Typography component={ButtonBase} onClick={collapseAll} sx={{ color:"text.secondary", px: 1, borderRadius: 1, '&:hover': { color: 'info.light' } }}>Collapse All</Typography>
          <Typography component={ButtonBase} onClick={expandAll} sx={{ px: 1, borderRadius: 1, '&:hover': { color: 'info.light' } }}>Expand All</Typography>
      </Stack>

      <Box sx={{ width: { xs: '100%', md: '80%' } }}>
        <TransitionGroup>
          {Object.entries(filteredTodosByDate).map(([dueDate, groupTodos]) => {
            const isOpen = !!datesOpen[dueDate];
            return (
              <Collapse key={dueDate}>
                <Box sx={{ mb: 1 }}>
                  {/* Date Label */}
                  <ButtonBase 
                    onClick={() => setDatesOpen(prev => ({ ...prev, [dueDate]: !prev[dueDate] }))} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      width: '100%', 
                      mb: 0.5, 
                      px: 1, 
                      py: 0.5,
                      borderRadius: 1,
                      textAlign: 'left',
                      '&:hover .dueDateLabel': { ml: 1.5 }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography 
                        className="dueDateLabel" 
                        sx={{ 
                          transition: 'margin .2s', 
                          ml: isOpen ? 1 : 0, 
                          fontWeight: '600',
                          color: isOpen ? 'text.primary' : 'text.secondary' 
                        }}
                      >
                        {dueDate}
                      </Typography>
                      {dueDate === todayStr && (
                        <Typography 
                          variant="caption"
                          fontWeight="bold"
                          sx={{ px: 1, py: 0.2, backgroundColor: 'info.main', color: 'white', borderRadius: 1 }}
                        >
                          Today
                        </Typography>
                      )}
                    </Stack>
                    <KeyboardArrowDown sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.4s' }} />
                  </ButtonBase>
                  {/* Todos list for this day */}
                  <Collapse in={!!datesOpen[dueDate]}>
                      <TransitionGroup component={Stack} spacing={1}>
                          {groupTodos.map(todo => (
                            <Collapse key={todo.id}>
                              <TodoListItem todoMeta={todo} />
                            </Collapse>
                          ))}
                      </TransitionGroup>
                  </Collapse>
                </Box>
              </Collapse>
            );
          })}
        </TransitionGroup>

        {!hasResults && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? `No results for "${searchTerm}"` : "Your schedule is clear!"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add New Task</DialogTitle>
        <Box component="form" onSubmit={handleAddTask}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField 
                fullWidth
                label="Task Description" 
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                autoFocus
              />
              <TextField 
                fullWidth
                type="date"
                label="Due Date" 
                value={dueDateString}
                onChange={(e) => setDueDateString(e.target.value)}
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