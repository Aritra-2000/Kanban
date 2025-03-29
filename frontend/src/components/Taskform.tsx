import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { RootState } from "../store/store";
import { Task , TaskInterface} from "../Types/task";


interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: Task) => void;
  defaultAssignee?: string;
  sectionId?: string;
}

const TaskForm: React.FC<TaskFormProps>= ({ open, onClose, onSubmit , defaultAssignee="",
  sectionId = "" }) => {

  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState<TaskInterface>({
    name: "",
    description: "",
    dueDate: "",
    assignee: user ? user.name : defaultAssignee,
    sectionId: sectionId
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      assignee: user ? user.name : "",
      sectionId: sectionId
    }));
  }, [user, defaultAssignee, sectionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    const taskWithId: Task = {
      id: crypto.randomUUID(), 
      ...formData
    };
    onSubmit(taskWithId);
    setFormData({ name: "", description: "", dueDate: "", assignee: user ? user.name : "", sectionId: sectionId});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Task</DialogTitle>
      <DialogContent>
        <TextField
          name="name"
          label="Task Name"
          fullWidth
          margin="dense"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          name="description"
          label="Description"
          fullWidth
          rows={3}
          margin="dense"
          value={formData.description}
          onChange={handleChange}
        />
        <TextField
          name="dueDate"
          label="Due Date"
          type="date"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={formData.dueDate}
          onChange={handleChange}
        />
        <TextField
          name="assignee"
          label="Assignee"
          fullWidth
          margin="dense"
          value={formData.assignee}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;