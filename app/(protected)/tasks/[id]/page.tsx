'use client'

import { 
  Typography, CircularProgress, Box, Skeleton, Stack, Avatar, 
  ButtonBase, MenuItem, Popper, Grow, Paper, ClickAwayListener, MenuList, 
  Tooltip, Collapse, Chip, Divider
} from "@mui/material"
import { use, useEffect, useMemo, useRef, useState } from "react"
import { useTasks } from "@/context/TasksContext"
import { useUsers } from "@/context/UsersContext"
import { Add } from "@mui/icons-material"
import { User } from "@/types/user"

interface TodosPageProps {
  params: Promise<{ id: string }>
}

export default function TodosPage({ params }: TodosPageProps) {
  const { id } = use(params); 
  const { tasks, loading, assignUser, assigningUser } = useTasks(); 
  const { users, usersLoading } = useUsers();

  const [addOpen, setAddOpen] = useState(false); 
  const addAnchorEl = useRef<HTMLButtonElement>(null);

  const taskData = useMemo(() => tasks.find(task => task.id === id), [tasks, id]);

  const isPastDue = useMemo(() => {
    if (!taskData || taskData.completed) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return today > taskData.dueDate.toDate();
  }, [taskData]);

  const daysLeft = useMemo(() => {
    if(!taskData) return null;
    const today = Date.now();
    const diffInMs = taskData.dueDate.toDate().getTime() - today; 
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  }, [taskData]);

  const chipColor = 
    taskData?.completed ? "success" 
    : isPastDue ? "error" 
    : (daysLeft !== null && daysLeft <= 1) ? "warning" 
    : "default";

  const createdByUser = useMemo(() => {
    if(!users || !taskData) return null;
    return users.find(thisUser => thisUser.id === taskData?.createdBy) || null;
  }, [users, taskData]);

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
      if (daysLeft === null) return "...";
      return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
    },
    [taskData, isPastDue, daysLeft]
  );

  const handleAssignUser = async (user: User) => {
    if (!taskData) return;
    try {
      await assignUser(taskData, user);
    } catch (error) {
      console.error("Failed to assign user:", error);
    } finally {
      setAddOpen(false);
    }
  }

  const handleToggleAssignMenu = () => {
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

  if (loading || usersLoading) { 
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!taskData) return <Typography variant="h6" sx={{ p: 4, textAlign: 'center' }}>Task not found.</Typography>;

  return (
    <Stack sx={{ p: 3, maxWidth: 650, mx: 'auto' }} spacing={3}>
      
      {/* Header Section */}
      <Stack spacing={2} direction="row" alignItems="flex-start" justifyContent="space-between">
        <Typography variant="h4" component="h1" fontWeight="bold">
          {taskData.task}
        </Typography>
        <Chip 
          label={taskStatus} 
          color={chipColor} 
          size="medium"
          sx={{ fontWeight: 'bold', mt: 0.5 }} 
        />
      </Stack>

      {/* Metadata Section */}
      <Box sx={{ color: 'text.secondary' }}>
        <Typography variant="body1">
          <strong>Created by:</strong> {createdByUser?.firstName} {createdByUser?.lastName}
        </Typography>
        <Typography variant="body1">
          <strong>Due:</strong> {taskData.dueDate.toDate().toLocaleDateString()}
        </Typography>
      </Box>

      {/* Assignment Section */}
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1.5} 
        sx={{ 
          py: 1.5, 
          px: 2, 
          borderRadius: 3, 
          backgroundColor: 'background.paper', 
          border: '1px solid',
          borderColor: 'divider',
          width: 'fit-content'
        }}
      >
        { assignedUsers === undefined
          ? <Stack direction="row" spacing={1}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Stack>
          : <Stack direction="row" spacing={1}>
              {assignedUsers.map((user) => (
                <Collapse 
                  key={user.id} 
                  orientation="horizontal" 
                  in={true} 
                  timeout={300}
                >
                  <Tooltip title={`${user.firstName} ${user.lastName} (${user.email})`}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </Typography>
                    </Avatar>
                  </Tooltip>
                </Collapse>
              ))}
            </Stack>
        }
        
        <Tooltip title="Assign new user">
          <ButtonBase 
            ref={addAnchorEl} 
            sx={{ 
              border: '2px dashed', 
              borderColor: 'divider', 
              borderRadius: '50%', 
              width: 40, 
              height: 40,
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' }
            }} 
            onClick={handleToggleAssignMenu}
            disabled={assigningUser}
          >
            {assigningUser ? <CircularProgress size={20} /> : <Add color="action" />}
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
            sx={{ zIndex: 1300 }}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
                }}
              >
                <Paper elevation={4} sx={{ mt: 1, minWidth: 200, overflow: 'hidden' }}>
                  <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Assign User
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuList
                    autoFocusItem={addOpen}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                    sx={{ p: 0 }}
                  >
                    {unassignedUsers && unassignedUsers.length > 0 ? (
                      unassignedUsers.map(user => (
                        <MenuItem key={user.id} sx={{ py: 1.5, px: 2 }} onClick={() => handleAssignUser(user)}>
                          <Typography variant="body1">{user.firstName} {user.lastName}</Typography>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          No users to assign
                        </Typography>
                      </MenuItem>
                    )}
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