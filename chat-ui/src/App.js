import React, { useState } from 'react';
import './index.css';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import ContractAnalysis from './components/ContractAnalysis';
import ContractMonitoring from './components/ContractMonitoring';
import MonitoringDashboard from './components/MonitoringDashboard';
import Chat from './components/Chat';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              FlareSense: DeFAI Security Agent
            </Typography>
          </Toolbar>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="navigation tabs"
            centered
            sx={{ bgcolor: 'background.paper' }}
          >
            <Tab label="Contract Analysis" />
            <Tab label="Activity Monitoring" />
            <Tab label="Blockchain Monitoring" />
            <Tab label="Chat" />
          </Tabs>
        </AppBar>

        <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <TabPanel value={currentTab} index={0}>
            <ContractAnalysis />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <ContractMonitoring />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <MonitoringDashboard />
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            <Chat />
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;