'use client';

import { 
  Box, Button, CircularProgress, IconButton, Stack, TextField, 
  Typography, InputAdornment, useMediaQuery, Collapse, ButtonBase, 
  Switch,
  FormControlLabel
} from "@mui/material";
import { useEffect, useState, useMemo, useRef } from "react";
import { Add, Clear, KeyboardArrowDown, Search } from "@mui/icons-material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { TransitionGroup } from 'react-transition-group';

// Context & Custom Components
import { useAuth } from "@/context/AuthContext";
import { useExpansion } from "@/context/ExpandedDatesContext";
import { useTasks } from "@/context/TasksContext";
import TaskListItem from "@/app/components/TaskListItem";
import AddTaskDialog from "@/app/components/AddTaskDialog";
import { Task } from "@/types/Task";

export default function Dashboard() {
  const { loading: authLoading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const { tasks, loading, deleteTask } = useTasks();
  const { expandedDates, toggleDate, setExpandedDates } = useExpansion();

  // Group and Filter tasks
  const filteredTasksByDate = useMemo(() => {
    const queryTerm = searchTerm.toLowerCase();
    const grouped: Record<string, Task[]> = {};

    const filtered = tasks
      .filter(t => ( (!showCompletedTasks ? !t.completed : true) && t.task.toLowerCase().includes(queryTerm) ))
      .sort((a, b) => a.dueDate.toDate().getTime() - b.dueDate.toDate().getTime());

    filtered.forEach(task => {
      const dateKey = task.dueDate.toDate().toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(task);
    });

    return grouped;
  }, [tasks, searchTerm, showCompletedTasks]);

  const allDateKeys = useMemo(() => Object.keys(filteredTasksByDate), [filteredTasksByDate]);
  const hasResults = allDateKeys.length > 0;
  const todayStr = new Date().toDateString();

  // Auto-expand "Today" on load
  const hasAutoExpanded = useRef(false);

  useEffect(() => {
    if (!loading && filteredTasksByDate[todayStr]) {
      if (!hasAutoExpanded.current) {
        if (!expandedDates.has(todayStr)) {
          toggleDate(todayStr);
        }
        hasAutoExpanded.current = true;
      }
    }
  }, [loading, filteredTasksByDate, todayStr, toggleDate, expandedDates]);

  const expandAll = () => setExpandedDates(new Set(allDateKeys));
  const collapseAll = () => setExpandedDates(new Set());

  // URL Syncing Debounce
  useEffect(() => {
    const currentQuery = searchParams.get('q') || "";
    if(searchTerm === currentQuery) return;
    
    const delayDebounceFn = setTimeout(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) params.set('q', searchTerm);
    else params.delete('q');
    
    // This updates the URL bar WITHOUT triggering a Next.js data fetch
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, replace, searchParams]);

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, md: 5 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    
      <Box sx={{ width: { xs: '100%', md: '80%', lg: '40rem' } }}>
        <Typography variant="h4" align="left" sx={{ my: 1, width: '100%', fontWeight: 'bold' }}>
          Schedule
        </Typography>

        {/* Search bar | Add button */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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
            sx={{ px: 3, whiteSpace: 'nowrap' }}
          >
            <Add sx={{ mr: isMobile ? 0 : 1 }} />
            {!isMobile && "Create Task"}
          </Button>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <FormControlLabel 
            control={ <Switch checked={showCompletedTasks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowCompletedTasks(e.target.checked)} /> }
            label="Show Completed"
            sx={{ color: showCompletedTasks ? 'text.primary' : 'text.secondary' }}
          />
          <Box>
            <Typography component={ButtonBase} onClick={expandAll} sx={{ fontSize: '0.875rem', px: 1, borderRadius: 1, '&:hover': { color: 'info.main' } }}>Expand All</Typography>
            <Typography component={ButtonBase} onClick={collapseAll} sx={{ fontSize: '0.875rem', color:"text.secondary", px: 1, borderRadius: 1, '&:hover': { color: 'info.main' } }}>Collapse All</Typography>
          </Box>
        </Stack>

        {/* Outer Transition Group */}
        <TransitionGroup>
          {Object.entries(filteredTasksByDate).map(([dueDate, groupTasks]) => {
            
            const isToday = dueDate === todayStr;
            // A date is open if: searching, it's manually expanded, OR it's Today and we haven't auto-expanded yet
            const isOpen = searchTerm !== "" || expandedDates.has(dueDate) || (isToday && !hasAutoExpanded.current);

            return (
              <Collapse key={dueDate}> 
                <Box>
                  {/* dueDate dropdown */}
                  <ButtonBase 
                    onClick={() => toggleDate(dueDate)} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      width: '100%', 
                      px: 1, py: 0.5,
                      mb: 1,
                      borderRadius: 1,
                      '&:hover .dueDateLabel': { color: 'primary.main' }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography 
                        className="dueDateLabel" 
                        sx={{ 
                          fontWeight: '600',
                          transition: 'color 0.2s',
                          color: isOpen ? 'text.primary' : 'text.secondary' 
                        }}
                      >
                        {dueDate}
                      </Typography>
                      {dueDate === todayStr && (
                        <Typography 
                          variant="caption"
                          sx={{ px: 1, py: 0.2, backgroundColor: 'info.main', color: 'white', borderRadius: 1, fontWeight: 'bold' }}
                        >
                          Today
                        </Typography>
                      )}
                    </Stack>
                    <KeyboardArrowDown sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
                  </ButtonBase>
                  
                  {/* Tasks List */}
                  <Box>
                    <Collapse in={isOpen}> 
                      <TransitionGroup sx={{ mt: 1 }}>
                        {groupTasks.map(task => (
                          // Individual Task
                          <Collapse key={task.id}>
                            <TaskListItem taskMeta={task} />
                          </Collapse>
                        ))}
                      </TransitionGroup>
                    </Collapse>
                  </Box>

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

      <AddTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}