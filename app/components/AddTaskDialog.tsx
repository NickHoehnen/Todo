import { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Button, Box } from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { Task } from "@/types/Task";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TasksContext";
import { useExpansion } from "@/context/ExpandedDatesContext";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from "dayjs";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTaskDialog({ open, onClose }: AddTaskDialogProps) {
  const { user } = useAuth();
  const { addTask, addingTask } = useTasks();
  const { expandedDates, toggleDate } = useExpansion();

  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs());

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dueDate) return; // Ensure dueDate isn't null

    // Dayjs makes conversion to native Date (for Firebase) very easy:
    const dateValue = dueDate.toDate(); 
    const dateStr = dateValue.toDateString();
    
    const newTask: Omit<Task, 'id'> = {
      task: taskTitle,
      assignedTo: [user.uid],
      dueDate: Timestamp.fromDate(dateValue),
      dateCompleted: null,
      completed: false,
    };

    await addTask(newTask);
    if (!expandedDates.has(dateStr)) toggleDate(dateStr);

    setTaskTitle("");
    setDueDate(dayjs()); // Reset to today
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 
                label="Due Date" 
                value={dueDate} 
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }} 
              />
            </LocalizationProvider>
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