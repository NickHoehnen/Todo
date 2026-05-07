'use client';

import { 
  Box, Button, CircularProgress, IconButton, Stack, TextField, 
  Typography, InputAdornment, useMediaQuery, Collapse, ButtonBase, 
  Switch, FormControlLabel, Chip
} from "@mui/material";
import { useEffect, useState, useMemo, useRef } from "react";
import { Add, Clear, KeyboardArrowDown, Search } from "@mui/icons-material";
import { useSearchParams, usePathname } from "next/navigation";
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
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  
  const { tasks, loading } = useTasks();
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
    if (!loading && !hasAutoExpanded.current && filteredTasksByDate[todayStr]) {
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
    if (searchTerm === currentQuery) return;
    
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (searchTerm) params.set('q', searchTerm);
      else params.delete('q');
      
      // Updates the URL bar WITHOUT triggering a Next.js data fetch
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, searchParams]);

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: .5, md: 5 }, py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    
      <Box sx={{ width: { xs: '100%', md: '80%', lg: '45rem' } }}>
        <Typography variant="h4" component="h1" align="left" sx={{ mb: 3, fontWeight: 'bold' }}>
          My Tasks
        </Typography>

        {/* Search bar & Add button */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button 
            variant="contained" 
            onClick={() => setDialogOpen(true)} 
            sx={{ 
              px: isMobile ? 2 : 3, 
              whiteSpace: 'nowrap',
              minWidth: isMobile ? 'auto' : undefined
            }}
            disableFocusRipple
          >
            <Add sx={{ mr: isMobile ? 0 : 1 }} />
            {!isMobile && "Create Task"}
          </Button>
        </Stack>

        {/* Toolbar */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <FormControlLabel 
            control={
              <Switch 
                size="small"
                checked={showCompletedTasks} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowCompletedTasks(e.target.checked)} 
              />
            }
            label={<Typography variant="body2" fontWeight="500">Show Completed</Typography>}
            sx={{ color: showCompletedTasks ? 'text.primary' : 'text.secondary', ml: 0 }}
          />
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="text" onClick={expandAll}>Expand All</Button>
            <Button size="small" variant="text" color="inherit" onClick={collapseAll}>Collapse All</Button>
          </Stack>
        </Stack>

        {/* Outer Transition Group */}
        <TransitionGroup>
          {Object.entries(filteredTasksByDate).map(([dueDate, groupTasks]) => {
            const isToday = dueDate === todayStr;
            // A date is open if: searching, it's manually expanded, OR it's Today and we haven't auto-expanded yet
            const isOpen = searchTerm !== "" || expandedDates.has(dueDate);

            return (
              <Collapse key={dueDate}> 
                <Box sx={{ mb: .5 }}>
                  {/* Due Date Header */}
                  <ButtonBase 
                    onClick={() => toggleDate(dueDate)} 
                    disableRipple
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      width: '100%', 
                      px: 2, 
                      py: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:hover .dueDateLabel': { color: 'primary.main' }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography 
                        className="dueDateLabel" 
                        variant="subtitle1"
                        sx={{ 
                          fontWeight: 'bold',
                          transition: 'color 0.2s',
                          color: isOpen ? 'text.primary' : 'text.secondary' 
                        }}
                      >
                        {dueDate}
                      </Typography>
                      {isToday && (
                        <Chip 
                          label="Today" 
                          size="small" 
                          color="info" 
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }} 
                        />
                      )}
                    </Stack>
                    <KeyboardArrowDown 
                      color="action"
                      sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} 
                    />
                  </ButtonBase>
                  
                  {/* Tasks List */}
                  <Collapse in={isOpen}> 
                    <Box sx={{ mt: 1, px: 1 }}>
                      <TransitionGroup>
                        {groupTasks.map(task => (
                          <Collapse key={task.id}>
                            <TaskListItem taskMeta={task} />
                          </Collapse>
                        ))}
                      </TransitionGroup>
                    </Box>
                  </Collapse>
                </Box>
              </Collapse>
            );
          })}
        </TransitionGroup>

        {/* Empty State */}
        {!hasResults && (
          <Box sx={{ mt: 10, textAlign: 'center', px: 2 }}>
            <Typography variant="h6" color="text.secondary" fontWeight="medium">
              {searchTerm ? `No results found for "${searchTerm}"` : "Your schedule is clear!"}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              {searchTerm ? "Try adjusting your search terms." : "Click 'Create Task' to add something new."}
            </Typography>
          </Box>
        )}
      </Box>

      <AddTaskDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}