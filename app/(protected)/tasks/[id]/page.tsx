'use client'

import { 
  Typography, CircularProgress, Box, Skeleton, Stack, Avatar, 
  ButtonBase, MenuItem, Popper, Grow, Paper, ClickAwayListener, MenuList, 
  Tooltip
} from "@mui/material"
import { use, useEffect, useMemo, useRef, useState } from "react"
import { useTasks } from "@/context/TasksContext"
import { useUsers } from "@/context/UsersContext"
import { Add, Person } from "@mui/icons-material"
import { User } from "@/types/user"
import { useAuth } from "@/context/AuthContext"

interface TodosPageProps {
  params: Promise<{ id: string }>
}

export default function TodosPage({ params }: TodosPageProps) {
  const { id } = use(params); 
  const { tasks, loading, assignUser } = useTasks(); 
  const { users, usersLoading } = useUsers();
  const { user } = useAuth();

  const [addOpen, setAddOpen] = useState(false); 
  const addAnchorEl = useRef<HTMLButtonElement>(null);

  const taskData = useMemo(() => tasks.find(task => task.id === id), [tasks, id]);

  const isPastDue = useMemo(() => {
    if (!taskData || taskData.completed) return false;
    return new Date() > taskData.dueDate.toDate();
  }, [taskData]);

  const daysLeft = useMemo(() => {
    if(!taskData) return null;
    const today = Date.now();
    const diffInMs = taskData.dueDate.toDate().getTime() - today; 
    const daysLeft = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return daysLeft;
  }, [taskData]);

  // Completed-green | PastDue-red | 1DayLeft-yellow | default-gray
  const taskColor = 
    (taskData?.completed) ?
      "success.main"
      : (isPastDue) ?
          "error.main"
          : (daysLeft && daysLeft <= 1) ?
            "warning.main"
            : "text.secondary";

  const badgeSx = {
    color: 'black',
    px: 1.5,
    borderRadius: 2,
    display: 'inline-block',
    mr: 1,
    verticalAlign: 'middle',
    fontWeight: 'bold', 
    bgcolor: taskColor
  };

  const createdByUser = useMemo(() => {
    if(!users || !taskData) return null;
    const u = users.find(thisUser => thisUser.id === taskData?.createdBy);
    if(!u) return null;
    return u;
  }, [users, taskData]);

  // FIX: Properly filtering users based on the task's assignedTo array
  const assignedUsers = useMemo(() => {
    if (!users || !taskData || !taskData.assignedTo) return undefined;
    return users.filter(user => taskData.assignedTo.includes(user.id));
  }, [users, taskData]);
  
  const unassignedUsers = useMemo(() => {
    if (!users || !taskData || !taskData.assignedTo) return undefined;
    return users.filter(user => !taskData.assignedTo.includes(user.id));
  }, [users, taskData])

  const taskStatus = useMemo(
    () => {
      if (!taskData) return "Error";
      if (taskData.completed) return "Completed";
      if (isPastDue) return "Past Due";
      if(daysLeft === null) return "...";
      return `${daysLeft} ${daysLeft > 1 ? "days" : "day"} left`;
    },
    [taskData, isPastDue]
  );

  // 2. Complete the handleAssignUser function
  const handleAssignUser = async (user: User) => {
    if (!taskData) return; // Safety check

    try {
      // Call the context function we built earlier
      await assignUser(taskData, user);
    } catch (error) {
      console.error("Failed to assign user:", error);
      // Optional: Add a toast/snackbar notification here to inform the user
    } finally {
      // Close the menu whether the assignment succeeded or failed
      setAddOpen(false);
    }
  }

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

  if (!taskData) return <Typography variant="h6" sx={{ p: 4 }}>Task not found.</Typography>;

  return (
    <Stack sx={{ p: 2, maxWidth: 600, mx: 'auto' }} spacing={1}>
      
      <Stack spacing={2} direction="row" sx={{ mb: 0 }} alignItems="center">
        {/* Task title */}
        <Typography variant="h3" component="h1" gutterBottom>
          {taskData.task}
        </Typography>
        {/* Completed status */}
        <Typography variant="overline" sx={{ ...badgeSx }}>
          {taskStatus}
        </Typography>
      </Stack>

      <Typography>Created by: {createdByUser?.firstName} {createdByUser?.lastName}</Typography>
      <Typography 
        variant="h6" 
        color="text.secondary" 
        component="span" 
        sx={{ verticalAlign: 'middle' }}
      >
        Due: {taskData.dueDate.toDate().toLocaleDateString()}
      </Typography>

      {/* Icons for assigned users */}
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
                  <Tooltip key={user.id} title={user.email}>
                    <Avatar key={user.id}>
                      {/* <Person /> */}
                      <Typography variant="subtitle2" fontWeight="bold">{user.firstName.charAt(0)} {user.lastName.charAt(0)}</Typography>
                    </Avatar>
                  </Tooltip>
                ))
              }
            </Stack>
        }
        
        <Tooltip title="Assign new user">
          <ButtonBase 
            ref={addAnchorEl} 
            sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '50%', width: 40, height: 40 }} 
            onClick={handleToggle}
          >
            <Add />
          </ButtonBase>
        </Tooltip>

        <ClickAwayListener onClickAway={handleClose}>
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
              <Paper sx={{ mt: 1, backgroundColor: 'background.elevated', pt: 1 }}>
                <Typography fontWeight="bold" sx={{ px: 1, pl: 2, userSelect: "none" }}>Assign user</Typography>
                <MenuList
                  autoFocusItem={addOpen}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  {unassignedUsers?.map(user => (
                    <MenuItem key={user.id} sx={{ py: 1 }} onClick={() => handleAssignUser(user)}>
                      <Typography variant="button">{user.firstName} {user.lastName}</Typography>
                    </MenuItem>
                  ))}
                </MenuList>
              </Paper>
            </Grow>
          )}
        </Popper>
        </ClickAwayListener>
      </Stack>
    </Stack>
  );
}