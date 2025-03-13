import React, { useState, useEffect } from 'react';
import './index.css';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import ContractAnalysis from './components/ContractAnalysis';
import ContractMonitoring from './components/ContractMonitoring';
import MonitoringDashboard from './components/MonitoringDashboard';
import RiskAssessment from './components/RiskAssessment';
import Chat from './components/Chat';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  // State to track if user has entered the dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  
  // State to track current page in dashboard
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check if there's a saved state in localStorage
  useEffect(() => {
    const savedDashboardState = localStorage.getItem('showDashboard');
    const savedCurrentPage = localStorage.getItem('currentPage');
    
    if (savedDashboardState === 'true') {
      setShowDashboard(true);
    }
    
    if (savedCurrentPage) {
      setCurrentPage(savedCurrentPage);
    }
  }, []);

  const handleGetStarted = () => {
    setShowDashboard(true);
    localStorage.setItem('showDashboard', 'true');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
  };
  
  // Function to go back to landing page
  const handleBackToLanding = () => {
    setShowDashboard(false);
    localStorage.removeItem('showDashboard');
  };

  // Render the appropriate component based on the current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'contract-analysis':
        return <ContractAnalysis />;
      case 'activity-monitoring':
        return <ContractMonitoring />;
      case 'blockchain-monitoring':
        return <MonitoringDashboard />;
      case 'risk-assessment':
        return <RiskAssessment />;
      case 'chat':
        return <Chat />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {showDashboard ? (
        <DashboardLayout 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          onBackToLanding={handleBackToLanding}
        >
          {renderCurrentPage()}
        </DashboardLayout>
      ) : (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
    </ThemeProvider>
  );
}

export default App;