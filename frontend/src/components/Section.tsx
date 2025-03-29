import { useState, memo, useRef} from "react";
import { useDrop } from "react-dnd";
import { useDispatch } from "react-redux";
import { addTask, deleteSection, updateSection, moveTask, addSection } from "../store/kanbanSlice";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from "@mui/icons-material/Add";
import TaskCard from "./TaskCard";
import TaskForm from "./Taskform";
import { RootState } from "../store/store";
import { Action, ThunkDispatch } from "@reduxjs/toolkit";
import { Task, TaskInterface } from "../Types/task";

export interface SectionData {
    id: string;
    name?: string;
    tasks: Task[];
}

interface DraggedTaskItem {
    taskId: string;
    sourceSectionId: string;
    task: TaskInterface; 
}

interface SectionProps {
    section: SectionData;
}

const Section: React.FC<SectionProps> = memo(({ section }) => {

  const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [newSectionTitle, setNewSectionTitle] = useState<string>("");


  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, Action>>();

  const dropRef = useRef<HTMLDivElement>(null);
  
  const [{ isOver }, drop] = useDrop<
    DraggedTaskItem, 
    void, 
    { isOver: boolean }
  >({
    accept: "TASK",
    drop: (item) => {
      if (item.sourceSectionId !== section.id) {
        dispatch(moveTask({
          taskId: item.taskId,
          sourceSectionId: item.sourceSectionId,
          destinationSectionId: section.id,
          task: item.task
        }));
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
    hover: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      if (item.sourceSectionId === section.id) return;
    }
  });

  const combinedRef = (instance: HTMLDivElement | null) => {
    dropRef.current = instance;
    drop(instance);
  };

  const handleAddTask = (taskData:Task) => {
    const newTask = { ...taskData, section: section.id, assignee: taskData.assignee || "Unassigned", };
    dispatch(addTask(newTask));
    setIsTaskFormOpen(false);
  };

  const handleAddSection = () => {
    if (newSectionTitle.trim() !== "") {
      const sectionData = {
        name: newSectionTitle,
        id: section.id
      };
      dispatch(addSection(sectionData));
      setNewSectionTitle("");
      setIsSectionFormOpen(false);
    }
  };

  const handleDeleteSection = () => {
    if (window.confirm(`Are you sure you want to delete the section "${section.name}"?`)) {
      dispatch(deleteSection(section.id));
    }
    setMenuAnchorEl(null);
  };

  const handleUpdateSection = () => {
    const newTitle = prompt("Enter new title for the section:", section.name);
    if (newTitle && newTitle.trim() !== "") {
      dispatch(updateSection({ id: section.id, name: newTitle }));
    }
    setMenuAnchorEl(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  return (
    <Box 
      ref={combinedRef} 
      height="100%" 
      bgcolor="white" 
      p={2}
      sx={{
        opacity: isOver ? 0.7 : 1,
        transition: 'opacity 0.15s ease',
        willChange: 'opacity',
        transform: 'translate3d(0,0,0)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h6 className="section-title">{section.name}</h6>
        <Box>
          <IconButton onClick={() => setIsSectionFormOpen(true)}>
            <AddIcon />
          </IconButton>
          <IconButton
            onClick={handleMenuOpen}
            aria-controls="section-menu"
            aria-haspopup="true"
          >
            <MoreHorizIcon />
          </IconButton>
          <Menu
            id="section-menu"
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem onClick={handleUpdateSection}>Update Title</MenuItem>
            <MenuItem onClick={handleDeleteSection} style={{ color: "red" }}>
              Delete Section
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box
        mt={1}
        sx={{
          height: "95%",
          overflowY: "auto",
          scrollbarWidth: "thin",
          bgcolor: "#F5F5F5",
          padding: 1,
          borderRadius: 2,
          minHeight: "200px",
          transform: 'translate3d(0,0,0)',
        }}
      >
        {(!section.tasks || section.tasks.length === 0) && (
          <Button variant="text" fullWidth onClick={() => setIsTaskFormOpen(true)} sx={{ color: "#a2a5ab", mt: 1 }}>
            + Add Task
          </Button>
        )}

        {section.tasks?.map((task) => (
          <TaskCard 
            key={`${task.id}-${section.id}`} 
            task={task}
            sectionId={section.id} 
          />
        ))}

        {section.tasks?.length > 0 && (
          <Button variant="text" fullWidth onClick={() => setIsTaskFormOpen(true)} sx={{ color: "#a2a5ab", mt: 1 }}>
            + Add Task
          </Button>
        )}
      </Box>

      <Dialog open={isSectionFormOpen} onClose={() => {
        setIsSectionFormOpen(false);
        setNewSectionTitle("");
      }}>
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Section Title"
            fullWidth
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsSectionFormOpen(false);
            setNewSectionTitle("");
          }}>
            Cancel
          </Button>
          <Button onClick={handleAddSection} variant="contained" color="primary">
            Add Section
          </Button>
        </DialogActions>
      </Dialog>
      
      <TaskForm
        open={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleAddTask}
        defaultAssignee=""
        sectionId={section.id}
      />
    </Box>
  );
});

export default Section;