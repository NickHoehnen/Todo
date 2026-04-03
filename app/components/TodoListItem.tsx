'use client'

import { 
  Avatar, IconButton, ListItem, ListItemAvatar, ListItemText, 
  ListItemButton, Menu, MenuItem, Dialog, 
  DialogTitle, DialogContent, DialogContentText, DialogActions, Button 
} from "@mui/material";
import { Todo } from "@/types/todo";
import { MoreHoriz, Person, Edit, Delete } from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";

interface TodoListItemProps {
  todoMeta: Todo;
}

export default function TodoListItem({ todoMeta }: TodoListItemProps) {
  const [menuAnchorElem, setMenuAnchorElem] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const menuOpen = Boolean(menuAnchorElem);
  const isPastDue = todoMeta && !todoMeta.dateCompleted && todoMeta.dueDate.toDate() < new Date();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchorElem(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchorElem(null);

  const promptDelete = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    try {
      // Deleting here triggers the parent's onSnapshot, 
      // which triggers the TransitionGroup animation.
      await deleteDoc(doc(db, "todos", todoMeta.id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          width: '100%',
          border: 1,
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
        <ListItemButton component={Link} href={`/todos/${todoMeta.id}`} sx={{ p: 2 }}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
              <Person />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={todoMeta.task}
            secondary={(isPastDue && "Overdue: ") + todoMeta.dueDate?.toDate()?.toDateString() || "No date set"}
            slotProps={{ secondary: { color: isPastDue ? 'error.main' : 'text.secondary' }}}
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
          <MenuItem onClick={handleMenuClose} component={Link} href={`/todos/${todoMeta.id}/edit`}>
            <Edit fontSize="small" sx={{ mr: 1.5 }} /> Edit
          </MenuItem>
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
            Are you sure you want to delete <strong>"{todoMeta.task}"</strong>? This action cannot be undone.
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