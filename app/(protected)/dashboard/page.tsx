'use client';

import { 
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  IconButton, Stack, TextField, Typography, InputAdornment, 
  useMediaQuery, Collapse, ButtonBase, CircularProgress
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
import { useExpansion } from "@/context/ExpandedDatesContext";
import { useTodos } from "@/context/TodosContext";
import AddTaskDialog from "@/app/components/AddTaskDialog";

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
  const { todos, loading } = useTodos();
  //const [dataLoading, setDataLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [todayStr, setTodayStr] = useState<string>("");

  const { expandedDates, toggleDate } = useExpansion();

  const allDates: Set<string> = useMemo(() => {
    return new Set(todos.map(todo => todo.dueDate.toDate().toDateString()));
  }, [todos, loading])

  const expandAll = () => {
    allDates.forEach(date => {
      if(!expandedDates.has(date)) toggleDate(date)
    })
  }
  const collapseAll = () => {
    Array.from(expandedDates).forEach(date => toggleDate(date))
  }

  // Auto-expand "today" once the data loads
  useEffect(() => {
    const localToday = new Date().toDateString();
    
    // Only run this check if we have dates and today hasn't been added to the state yet
    if (allDates.has(localToday) && !expandedDates.has(localToday)) {
      setTodayStr(localToday);
      toggleDate(localToday);
    }
  }, [loading]);

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


  if (authLoading || loading) {
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

      <Box sx={{ width: { xs: '100%', md: '80%' } }}>
        <Stack direction="row-reverse" spacing={1} sx={{ width: '100%', display: 'flex', alignItems: 'end' }}>
          <Typography component={ButtonBase} onClick={collapseAll} sx={{ color:"text.secondary", px: 1, borderRadius: 1, '&:hover': { color: 'info.light' } }}>Collapse All</Typography>
          <Typography component={ButtonBase} onClick={expandAll} sx={{ px: 1, borderRadius: 1, '&:hover': { color: 'info.light' } }}>Expand All</Typography>
       </Stack>

        <TransitionGroup>
          {Object.entries(filteredTodosByDate).map(([dueDate, groupTodos]) => {
            const isOpen = expandedDates.has(dueDate);
            return (
              <Collapse key={dueDate}>
                <Box sx={{ mb: 1 }}>
                  {/* Date Label */}
                  <ButtonBase 
                    onClick={() => toggleDate(dueDate)} 
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
                  <Collapse in={expandedDates.has(dueDate)}>
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
      <AddTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}