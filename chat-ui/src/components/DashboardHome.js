import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  useTheme
} from '@mui/material';

// Create simple icon components to avoid Material-UI icon dependencies
const IconWrapper = ({ children, color }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        bgcolor: `${color}15`,
        color: color,
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}
    >
      {children}
    </Box>
  );
};

// Mock data for the dashboard
const summaryData = [
  { 
    title: 'Monitored Addresses', 
    value: '3', 
    icon: <IconWrapper color="#1976d2">👛</IconWrapper>,
    color: '#1976d2'
  },
  { 
    title: 'Monitored Protocols', 
    value: '5', 
    icon: <IconWrapper color="#2e7d32">🔒</IconWrapper>,
    color: '#2e7d32'
  },
  { 
    title: 'Active Alerts', 
    value: '2', 
    icon: <IconWrapper color="#ed6c02">⚠️</IconWrapper>,
    color: '#ed6c02'
  },
  { 
    title: 'Blockchain Activity', 
    value: '+12%', 
    icon: <IconWrapper color="#9c27b0">📈</IconWrapper>,
    color: '#9c27b0'
  },
];

const recentAlerts = [
  {
    id: 1,
    title: 'Whale Transaction Detected',
    description: 'Large transfer of 15,000 FLR detected from a known exchange wallet.',
    time: '5 minutes ago',
    severity: 'medium'
  },
  {
    id: 2,
    title: 'Security Vulnerability Alert',
    description: 'Potential reentrancy vulnerability in a popular DeFi lending protocol.',
    time: '1 hour ago',
    severity: 'high'
  },
  {
    id: 3,
    title: 'Unusual Activity',
    description: 'Multiple rapid transactions detected from a single address.',
    time: '3 hours ago',
    severity: 'low'
  }
];

const SummaryCard = ({ title, value, icon, color }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: `${color}15`,
            color: color
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'high':
      return <Box sx={{ color: '#d32f2f', fontSize: '1.2rem' }}>🔴</Box>;
    case 'medium':
      return <Box sx={{ color: '#ed6c02', fontSize: '1.2rem' }}>🟠</Box>;
    case 'low':
      return <Box sx={{ color: '#0288d1', fontSize: '1.2rem' }}>🔵</Box>;
    default:
      return <Box sx={{ color: '#0288d1', fontSize: '1.2rem' }}>🔵</Box>;
  }
};

const DashboardHome = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome back! Here's an overview of your DeFi security monitoring and analysis tools. FlareSense provides comprehensive security features including smart contract analysis, risk assessment, real-time monitoring, and Telegram alerts.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <SummaryCard 
              title={item.title} 
              value={item.value} 
              icon={item.icon} 
              color={item.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Alerts
              </Typography>
              <Button 
                variant="text" 
                endIcon={<Box component="span" sx={{ fontSize: '1.2rem' }}>⋯</Box>}
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ p: 0 }}>
              {recentAlerts.map((alert) => (
                <React.Fragment key={alert.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getSeverityIcon(alert.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {alert.title}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {alert.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.time}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {alert.id !== recentAlerts.length && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Monitored Assets */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Monitored Assets
              </Typography>
              <Button 
                variant="text" 
                endIcon={<Box component="span" sx={{ fontSize: '1.2rem' }}>⋯</Box>}
                size="small"
              >
                Manage
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Addresses
            </Typography>
            <List dense sx={{ mb: 2 }}>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="0x742d35Cc6634C0532925a3b844Bc454e4438f44e" 
                  secondary="Added 2 days ago"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="0x1234567890abcdef1234567890abcdef12345678" 
                  secondary="Added 1 day ago"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t" 
                  secondary="Added 5 hours ago"
                />
              </ListItem>
            </List>
            
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Protocols
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Uniswap" 
                  secondary="Added 3 days ago"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Aave" 
                  secondary="Added 3 days ago"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="Compound" 
                  secondary="Added 2 days ago"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="MakerDAO" 
                  secondary="Added 1 day ago"
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText 
                  primary="LendingProtocol" 
                  secondary="Added 5 hours ago"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome; 