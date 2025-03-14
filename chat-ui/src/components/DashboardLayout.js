import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SecurityIcon from '@mui/icons-material/Security';
import MonitorIcon from '@mui/icons-material/Monitor';
import ChatIcon from '@mui/icons-material/Chat';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import TelegramIcon from '@mui/icons-material/Telegram';

const drawerWidth = 260;

const DashboardLayout = ({ children, currentPage, onPageChange, onBackToLanding }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    if (onBackToLanding) {
      onBackToLanding();
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
    { text: 'Contract Analysis', icon: <SecurityIcon />, value: 'contract-analysis' },
    { text: 'Activity Monitoring', icon: <MonitorIcon />, value: 'activity-monitoring' },
    { text: 'Blockchain Monitoring', icon: <AnalyticsIcon />, value: 'blockchain-monitoring' },
    { text: 'Risk Assessment', icon: <Box component="span" sx={{ fontSize: '1.5rem' }}>🛡️</Box>, value: 'risk-assessment' },
    { text: 'Telegram Bot', icon: <TelegramIcon />, value: 'telegram-bot' },
    { text: 'Chat Assistant', icon: <ChatIcon />, value: 'chat' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          background: 'white',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            FlareSense
          </Typography>
          
          <Tooltip title="Back to Home">
            <IconButton 
              color="inherit" 
              onClick={onBackToLanding}
              sx={{ mr: 1 }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          
          <IconButton 
            color="inherit" 
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleProfileMenuOpen}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: theme.palette.primary.main 
              }}
            >
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
      
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight="bold">Whale Transaction Detected</Typography>
            <Typography variant="body2" color="text.secondary">
              Large transfer of 15,000 FLR detected
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              5 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight="bold">Security Alert</Typography>
            <Typography variant="body2" color="text.secondary">
              Potential vulnerability in DeFi protocol
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight="bold">Address Registered</Typography>
            <Typography variant="body2" color="text.secondary">
              Your address was successfully registered for monitoring
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              2 hours ago
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
      
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            background: theme.palette.grey[50],
            borderRight: `1px solid ${theme.palette.grey[200]}`
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', px: 2, py: 2 }}>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ mb: 2 }}>
              <ChevronLeftIcon />
            </IconButton>
          )}
          
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={currentPage === item.value}
                  onClick={() => onPageChange(item.value)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', mt: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Monitoring Status
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Blockchain</Typography>
              <Box sx={{ 
                px: 1, 
                py: 0.5, 
                borderRadius: 1, 
                bgcolor: 'success.light', 
                color: 'success.dark',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                Active
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">News Feed</Typography>
              <Box sx={{ 
                px: 1, 
                py: 0.5, 
                borderRadius: 1, 
                bgcolor: 'success.light', 
                color: 'success.dark',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                Active
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 0, overflow: 'auto' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 