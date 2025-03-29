import {AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, InputAdornment, Menu, MenuItem, TextField, Toolbar, Typography, useMediaQuery, useTheme} from "@mui/material"
import { useSelector, useDispatch } from "react-redux"
import MenuIcon from '@mui/icons-material/Menu';
import AppleIcon from '@mui/icons-material/Apple';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';

import { SetStateAction, useEffect, useState } from "react";
import { addSection, fetchSections } from "../store/kanbanSlice";
import { fetchCurrentUser, fetchUserCount, logoutUser } from "../store/authSlice";
import LoadingScreen from "./LoadingScreen";
import Section from "./Section";
import AuthForm from "./AuthForm";
import { Task } from "../Types/task";

interface AuthState{
  user:{
    profilePic?: string,
    name?: string,
    email?:string,
    [key: string]: any;
  } | null;
  
  token: string | null;
  userCount: number;
}

export interface SectionData {
    id: string;
    name?: string;
    tasks: Task[];
}

interface KanbanState{
  sections: SectionData[],
  loading: boolean,
}

interface RootState{
  auth: AuthState;
  kanban: KanbanState;
}

const selectAuth = (state: RootState) => state.auth;
const selectKanban = (state: RootState) => state.kanban;


const Board = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const {sections, loading} = useSelector(selectKanban);
  const auth = useSelector(selectAuth) || {};
  const user = auth?.user;
  const token = auth?.token;
  const userPhoto = auth?.user?.profilePic;
  const userCount = useSelector((state: RootState) => state.auth.userCount);

  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const [isAuthFormOpen, setIsAuthFormOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() =>{
    dispatch(fetchSections() as any);
  },[dispatch]);

  useEffect(() =>{
    if(token && !user){
      dispatch(fetchCurrentUser() as any);
    }
  },[token, user, dispatch]);

  useEffect(() =>{
     dispatch(fetchUserCount() as any)
  },[dispatch]);


  const handleSearch = (e: { target: { value: SetStateAction<string> }; }) =>{
    setSearchQuery(e.target.value);
  }

  const handleAddSection = () => {
    if(newSectionTitle.trim() !== ""){
      dispatch(addSection({
        name: newSectionTitle,
        id: ""
      }) as any);
    }
  }

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLButtonElement> ) =>{
    setUserMenuAnchorEl(e.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser() as any);
    handleUserMenuClose();
  };

  const renderAuthButton = () => {
    if (!token) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAuthFormOpen(true)}
          size={isMobile ? "small" : "medium"}
        >
          Sign Up / Login
        </Button>
      );
    }
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton 
          color="primary" 
          size="small"
          edge="start"
          disabled={false}
          onClick={handleUserMenuOpen}
        >
          <Avatar
            src={userPhoto}
            alt={user?.name}
            sx={{
              width: isMobile ? 32 : 40,
              height: isMobile ? 32 : 40,
              cursor: 'pointer'
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : '?'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={userMenuAnchorEl}
          open={Boolean(userMenuAnchorEl)}
          onClose={handleUserMenuClose}
        >
          <MenuItem>
            <Typography variant="body2">{user?.name}</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="h-screen">
        <AppBar position="static" elevation={0} sx={{
            bgcolor: 'white',
            color: 'black',
            boxShadow: 'none',
            height: '64px'}}
        >
         <Toolbar sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '64px !important'
          }}>
          <Box display="flex" alignItems="center" gap={1}>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              edge="start"
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <AppleIcon fontSize={isMobile ? 'medium' : 'large'} />
          {!isMobile && (
            <Box>
              <Typography variant={isMobile ? 'body2' : 'body1'}>
                Kanban Board
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {sections.length} boards • {userCount} members
              </Typography>
            </Box>
          )} 
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          sx={{
            order: isMobile ? 2 : 0,
            width: isMobile ? '100%' : 'auto',
            mt: isMobile ? 1 : 0,
          }}
        >
          {!isMobile && (
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{
                width: isTablet ? 150 : 250,
                bgcolor: '#F4F5F7',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          {renderAuthButton()}
         </Box>
         </Toolbar>
        </AppBar>

        <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Kanban Board</Typography>
          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" color="textSecondary">
            {sections.length} boards • {userCount} members
          </Typography>
        </Box>
      </Drawer>

      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 64px - 20px)", 
          overflowX: "auto",
          overflowY: "auto",
          padding: 1,
          scrollbarWidth: "thin", 
          scrollbarColor: "#D1D5DB transparent", 
          "&::-webkit-scrollbar": {
            height: "5px", 
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#D1D5DB", 
            borderRadius: "10px",
          },
        }}
      >
        {sections && Array.isArray(sections) && sections.map((section) => (
          <Box key={section.id}
            sx={{
              minWidth: isMobile ? "85vw" : 300,
              maxWidth: isMobile ? "85vw" : 300,
              mr: 2
            }}
          >
            <Section key={`${section.id}-${section.tasks.length}`} section={section} />
          </Box>
        ))}

        <Box sx={{ display: "flex", alignItems: "center", height: "40px", mt: "10px", ml: "10px" }}>
          <Button variant="text" onClick={() => setIsSectionFormOpen(true)} sx={{ height: "40px", width: "200px", color: "#a2a5ab" }}>
            <AddIcon /> Add Section
          </Button>
        </Box>
      </Box>

      <Dialog open={isSectionFormOpen} onClose={() => setIsSectionFormOpen(false)}>
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          <TextField label="Section Title" fullWidth value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSectionFormOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAddSection}>
            Add Section
          </Button>
        </DialogActions>
      </Dialog>

      <AuthForm open={isAuthFormOpen} handleClose={() => setIsAuthFormOpen(false)} />
    </div>
  )
}

export default Board