'use client'

import { 
  Avatar, IconButton, ListItem, ListItemAvatar, ListItemText, 
  ListItemButton, Menu, MenuItem, Dialog, 
  DialogTitle, DialogContent, DialogContentText, DialogActions, Button 
} from "@mui/material";
import { Task } from "@/types/Task";
import { MoreHoriz, Person, Edit, Delete, Check, DoNotDisturb } from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";
import { useTasks } from "@/context/TasksContext";

interface TaskListItemProps {
  taskMeta: Task;
}

export default function TaskListItem({ taskMeta }: TaskListItemProps) {
  const [menuAnchorElem, setMenuAnchorElem] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { deleteTask, markComplete, markIncomplete } = useTasks();
  
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

  let secondaryText = "No date set";
  if (completed) {
    secondaryText = "Completed";
  } else if (hasDueDate) {
    secondaryText = `${isPastDue ? "Overdue: " : "Due: "} ${taskMeta.dueDate.toDate().toDateString()}`;
  }

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          width: '100%',
          border: 1.5,
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: 'primary.light' }
        }}
        secondaryAction={
          <IconButton sx={{ mr: { xs: 0, sm: 1} }} edge="end" onClick={handleMenuOpen}>
            <MoreHoriz />
          </IconButton>
        }
      >
        <ListItemButton component={Link} href={`/tasks/${taskMeta.id}`} sx={{ p: 2 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
              <Person />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={taskMeta.task}
            secondary={secondaryText}
            slotProps={{ 
              secondary: { 
                color: (isPastDue && !completed) ? 'error.main' : completed ? 'success.main' : 'text.secondary' 
              }
            }}
            primaryTypographyProps={{ fontWeight: 'medium' }}
          />
        </ListItemButton>

        <Menu 
          anchorEl={menuAnchorElem} 
          open={menuOpen} 
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleMenuClose} component={Link} href={`/tasks/${taskMeta.id}/edit`}>
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