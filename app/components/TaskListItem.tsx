'use client'

import { 
  Avatar, IconButton, ListItem, ListItemAvatar, ListItemText, 
  ListItemButton, Menu, MenuItem, Dialog, 
  DialogTitle, DialogContent, DialogContentText, DialogActions, Button, 
  Typography, TextField, Box
} from "@mui/material";
import { Task } from "@/types/Task";
import { MoreHoriz, Person, Edit, Delete, Check, DoNotDisturb } from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";
import { useTasks } from "@/context/TasksContext";
import { Dayjs } from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";

interface TaskListItemProps {
  taskMeta: Task;
}

interface NewValuesType {
  title: string;
  dueDate: Dayjs | null;
}

export default function TaskListItem({ taskMeta }: TaskListItemProps) {
  const [menuAnchorElem, setMenuAnchorElem] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newValues, setNewValues] = useState<NewValuesType>({ title: '', dueDate: null });

  const { deleteTask, markComplete, markIncomplete, updateTask } = useTasks(); 
  
  const menuOpen = Boolean(menuAnchorElem);
  const completed = taskMeta.completed;
  const hasDueDate = !!taskMeta.dueDate;
  
  const isPastDue = hasDueDate && !completed && taskMeta.dueDate.toDate() < new Date();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchorElem(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchorElem(null);

  const handleMarkComplete = () => {
    markComplete(taskMeta.id);
    handleMenuClose();
  };
  
  const handleMarkIncomplete = () => {
    markIncomplete(taskMeta.id);
    handleMenuClose();
  };

  const promptDelete = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    deleteTask(taskMeta.id);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setNewValues({ 
      title: taskMeta.task, 
      dueDate: taskMeta.dueDate ? dayjs(taskMeta.dueDate.toDate()) : null 
    });
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (updateTask) {
      await updateTask({ 
        ...taskMeta,
        task: newValues.title, 
        dueDate: newValues.dueDate ? Timestamp.fromDate(newValues.dueDate.toDate()) : taskMeta.dueDate
      });
    }
    setIsEditing(false);
  };

  let statusLabel = "No date set";
  if (completed) {
    statusLabel = "Completed";
  } else if (hasDueDate) {
    statusLabel = `${isPastDue ? "Overdue: " : "Due: "} ${taskMeta.dueDate.toDate().toDateString()}`;
  }

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const editTitle = (
    <TextField 
      label="Task Description" 
      value={newValues.title}
      onChange={(e) => setNewValues(prev => ({ ...prev, title: e.target.value }))}
      onClick={handleInputClick}
      size="small"
      sx={{ width: "90%" }}
      required
      autoFocus
    />
  );

  const editDueDate = (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Due Date" 
        value={newValues.dueDate} 
        onChange={(newValue) => setNewValues(prev => ({ ...prev, dueDate: newValue }))}
        sx={{ width: "90%" }}
        slotProps={{ 
          textField: { 
            required: true, 
            size: "small",
            onClick: handleInputClick 
          } 
        }} 
      />
    </LocalizationProvider>
  );

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          width: '100%',
          mb: 1,
          border: 1.5,
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          transition: 'all 0.2s ',
          '&:hover': { borderColor: 'primary.light' },
        }}
        secondaryAction={
          <IconButton 
            sx={{ mr: { xs: 0, sm: 1} }} 
            edge="end" 
            onClick={isEditing ? handleSaveEdit : handleMenuOpen}
            color={isEditing ? "success" : "default"}
          >
            { isEditing ? <Check /> : <MoreHoriz /> }
          </IconButton>
        }
      >
        <ListItemButton 
          component={isEditing ? "div" : Link} 
          href={isEditing ? undefined : `/tasks/${taskMeta.id}`} 
          sx={{ p: 2 }}
          disableRipple={isEditing}
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
              <Person />
            </Avatar>
          </ListItemAvatar>
          
          {/* FIXED: Conditionally render a Box for inputs, bypassing ListItemText entirely to avoid <p> nesting errors */}
          {isEditing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1.5 }}>
              {editTitle}
              {editDueDate}
            </Box>
          ) : (
            <ListItemText
              primary={<Typography className="taskTitle">{taskMeta.task}</Typography>}
              secondary={statusLabel}
              slotProps={{ 
                secondary: { 
                  color: (isPastDue && !completed) ? 'error.main' : completed ? 'success.main' : 'text.secondary' 
                }
              }}
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          )}

        </ListItemButton>

        <Menu 
          anchorEl={menuAnchorElem} 
          open={menuOpen} 
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleStartEdit}>
            <Edit fontSize="small" sx={{ mr: 1.5 }} /> Edit
          </MenuItem>
          {
            taskMeta.completed ?
              <MenuItem onClick={handleMarkIncomplete} sx={{ color: 'warning.main' }}>
                <DoNotDisturb fontSize="small" sx={{ mr: 1.5 }} /> Incomplete
              </MenuItem> :
              <MenuItem onClick={handleMarkComplete} sx={{ color: 'success.main' }}>
                <Check fontSize="small" sx={{ mr: 1.5 }} /> Complete
              </MenuItem>
          }
          <MenuItem onClick={promptDelete} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1.5 }} /> Delete
          </MenuItem>
        </Menu>
      </ListItem>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>&quot;{taskMeta.task}&quot;</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}