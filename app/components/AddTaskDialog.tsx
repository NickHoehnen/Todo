import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Button, Box } from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { Todo } from "@/types/todo";
import { useAuth } from "@/context/AuthContext";
import { useTodos } from "@/context/TodosContext";
import { useExpansion } from "@/context/ExpandedDatesContext";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTaskDialog({ open, onClose }: AddTaskDialogProps) {
  const { user } = useAuth();
  const { addTodo, addingTask } = useTodos();
  const { expandedDates, toggleDate } = useExpansion();

  // Form state is now isolated here!
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDateString, setDueDateString] = useState("");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const [year, month, day] = dueDateString.split('-').map(Number);
    const dateValue = new Date(year, month - 1, day);
    const dateStr = dateValue.toDateString();
    
    const newTodo: Omit<Todo, 'id'> = {
      task: taskTitle,
      assignedTo: [user.uid],
      dueDate: Timestamp.fromDate(dateValue),
      dateCompleted: null,
      completed: false,
    };

    await addTodo(newTodo);

    if (!expandedDates.has(dateStr)) toggleDate(dateStr);

    // Reset and close
    setTaskTitle("");
    setDueDateString("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={addingTask} type="submit" variant="contained">
            {addingTask ? "Saving..." : "Save Task"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}