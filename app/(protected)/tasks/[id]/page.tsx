'use client'

import { 
  Typography, CircularProgress, Box, Skeleton, Stack, Avatar, 
  ButtonBase, MenuItem, Popper, Grow, Paper, ClickAwayListener, MenuList 
} from "@mui/material"
import { use, useEffect, useMemo, useRef, useState } from "react"
import { useTasks } from "@/context/TasksContext"
import { useUsers } from "@/context/UsersContext"
import { Add, Person } from "@mui/icons-material"
import { User } from "@/types/user"

interface TodosPageProps {
  params: Promise<{ id: string }>
}

export default function TodosPage({ params }: TodosPageProps) {
  const { id } = use(params); 
  const { tasks, loading, assignUser } = useTasks(); 
  const { users, usersLoading } = useUsers();

  // ... (state and useMemos stay the same)

  const [addOpen, setAddOpen] = useState(false); 
  const addAnchorEl = useRef<HTMLButtonElement>(null);

  const badgeSx = {
    color: 'black',
    px: 1.5,
    py: 0.5,
    borderRadius: '16px',
    display: 'inline-block',
    mr: 1,
    verticalAlign: 'middle',
    fontWeight: 'bold', 
  };

  // 2. Complete the handleAssignUser function
  const handleAssignUser = async (user: User) => {
    if (!todoData) return; // Safety check

    try {
      // Call the context function we built earlier
      await assignUser(todoData, user);
    } catch (error) {
      console.error("Failed to assign user:", error);
      // Optional: Add a toast/snackbar notification here to inform the user
    } finally {
      // Close the menu whether the assignment succeeded or failed
      setAddOpen(false);
    }
  }
  
  const todoData = useMemo(() => tasks.find(task => task.id === id), [tasks, id]);

  const isPastDue = useMemo(() => {
    if (!todoData || todoData.completed) return false;
    return new Date() > todoData.dueDate.toDate();
  }, [todoData]);

  // FIX: Properly filtering users based on the task's assignedTo array
  const assignedUsers = useMemo(() => {
    if (!users || !todoData || !todoData.assignedTo) return undefined;
    return users.filter(user => todoData.assignedTo.includes(user.id));
  }, [users, todoData]);
  
  const unassignedUsers = useMemo(() => {
    if (!users || !todoData || !todoData.assignedTo) return undefined;
    return users.filter(user => !todoData.assignedTo.includes(user.id));
  }, [users, todoData])

  const handleToggle = () => {
    setAddOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      addAnchorEl.current &&
      addAnchorEl.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setAddOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setAddOpen(false);
    } else if (event.key === 'Escape') {
      setAddOpen(false);
    }
  }

  const prevOpen = useRef(addOpen);
  useEffect(() => {
    if (prevOpen.current === true && addOpen === false) {
      addAnchorEl.current?.focus();
    }
    prevOpen.current = addOpen;
  }, [addOpen]);

  if (loading || usersLoading) { // Also waiting for users to load
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

      <Stack direction="row" alignItems="center" spacing={1}>
        { assignedUsers === undefined
          ? <Stack direction="row" spacing={1}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Stack>
          : <Stack direction="row" spacing={1}>
              {
                assignedUsers.map(user => (
                  <Avatar key={user.id}><Person /></Avatar>
                ))
              }
            </Stack>
        }
        
        {/* FIX: Attached the ref and updated onClick */}
        <ButtonBase 
          ref={addAnchorEl} 
          sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '50%', width: 40, height: 40 }} 
          onClick={handleToggle}
        >
          <Add />
        </ButtonBase>

        <Popper
          open={addOpen}
          anchorEl={addAnchorEl.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Paper sx={{ mt: 1 }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={addOpen}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    {unassignedUsers?.map(user => (
                      <MenuItem key={user.id} onClick={() => handleAssignUser(user)}>
                        {user.firstName} {user.lastName}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Stack>
    </Box>
  );
}