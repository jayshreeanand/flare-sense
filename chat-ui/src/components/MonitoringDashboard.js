import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  useTheme
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

const AlertSeverityBadge = ({ severity }) => {
  const theme = useTheme();
  
  const getColor = () => {
    switch (severity.toLowerCase()) {
      case 'high':
        return {
          bg: theme.palette.error.light,
          text: theme.palette.error.dark,
          icon: <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
        };
      case 'medium':
        return {
          bg: theme.palette.warning.light,
          text: theme.palette.warning.dark,
          icon: <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
        };
      case 'low':
        return {
          bg: theme.palette.info.light,
          text: theme.palette.info.dark,
          icon: <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
        };
      default:
        return {
          bg: theme.palette.grey[100],
          text: theme.palette.grey[800],
          icon: <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
        };
    }
  };

  const { bg, text, icon } = getColor();

  return (
    <Chip
      icon={icon}
      label={severity.toUpperCase()}
      size="small"
      sx={{
        bgcolor: bg,
        color: text,
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: text
        }
      }}
    />
  );
};

const AlertTypeIcon = ({ type }) => {
  const theme = useTheme();
  
  const getIconInfo = () => {
    switch (type.toLowerCase()) {
      case 'whale_transaction':
        return {
          icon: <MonetizationOnIcon />,
          color: theme.palette.primary.main,
          bg: `${theme.palette.primary.main}15`
        };
      case 'unusual_activity':
        return {
          icon: <VisibilityIcon />,
          color: theme.palette.warning.main,
          bg: `${theme.palette.warning.main}15`
        };
      case 'vulnerable_contract':
        return {
          icon: <SecurityIcon />,
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      case 'security_news':
        return {
          icon: <NewReleasesIcon />,
          color: theme.palette.info.main,
          bg: `${theme.palette.info.main}15`
        };
      case 'protocol_compromise':
        return {
          icon: <ErrorIcon />,
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      default:
        return {
          icon: <InfoIcon />,
          color: theme.palette.grey[700],
          bg: theme.palette.grey[100]
        };
    }
  };

  const { icon, color, bg } = getIconInfo();

  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1.5,
        borderRadius: 2,
        bgcolor: bg,
        color: color,
        mr: 2
      }}
    >
      {icon}
    </Box>
  );
};

const AlertCard = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 2, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <AlertTypeIcon type={alert.type} />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {alert.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AlertSeverityBadge severity={alert.severity} />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {expanded ? alert.description : `${alert.description.substring(0, 100)}${alert.description.length > 100 ? '...' : ''}`}
          </Typography>
          {alert.description.length > 100 && (
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ p: 0, minWidth: 'auto', fontWeight: 'normal', fontSize: '0.75rem' }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </Button>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                Source: {alert.source}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(alert.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          
          {expanded && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              {alert.affected_protocols.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                    Affected Protocols:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {alert.affected_protocols.map((protocol, idx) => (
                      <Chip 
                        key={idx} 
                        label={protocol} 
                        size="small" 
                        sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {alert.affected_addresses.length > 0 && (
                <Box>
                  <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                    Affected Addresses:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {alert.affected_addresses.map((addr, idx) => (
                      <Chip 
                        key={idx} 
                        label={`${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`} 
                        size="small"
                        sx={{ bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.contrastText }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const MonitoringDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    severity: '',
  });
  const [addressInput, setAddressInput] = useState('');
  const [protocolInput, setProtocolInput] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState({
    message: '',
    type: '' // 'success' or 'error'
  });
  const theme = useTheme();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        try {
          // Try to fetch from the real API
          const response = await axios.get('/api/routes/monitoring/alerts', {
            params: {
              limit: 50,
              ...(filter.type && { alert_type: filter.type }),
              ...(filter.severity && { severity: filter.severity }),
            }
          });
          setAlerts(response.data);
          setError(null);
        } catch (err) {
          console.log('Using mock data due to API error:', err);
          
          // If the API fails, use mock data for demonstration
          const mockAlerts = [
            {
              id: "mock-1",
              type: "whale_transaction",
              title: "Large FLR Transfer Detected",
              description: "A transaction of 15,000 FLR was detected from a known exchange wallet to an unknown wallet. This could indicate accumulation by a large holder.",
              source: "Blockchain Monitor",
              severity: "medium",
              timestamp: new Date().toISOString(),
              affected_protocols: [],
              affected_addresses: ["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"]
            },
            {
              id: "mock-2",
              type: "security_news",
              title: "Potential Vulnerability in DeFi Protocol",
              description: "Security researchers have identified a potential reentrancy vulnerability in a popular DeFi lending protocol. No exploits have been reported yet, but users should exercise caution.",
              source: "DeFi Security News",
              severity: "high",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              affected_protocols: ["LendingProtocol"],
              affected_addresses: []
            },
            {
              id: "mock-3",
              type: "unusual_activity",
              title: "Unusual Transaction Pattern Detected",
              description: "Multiple rapid transactions have been detected from a single address, potentially indicating automated trading or an attempt to manipulate market conditions.",
              source: "Blockchain Monitor",
              severity: "low",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              affected_protocols: [],
              affected_addresses: ["0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"]
            }
          ];
          
          // Filter mock data based on user filters
          let filteredMockAlerts = [...mockAlerts];
          
          if (filter.type) {
            filteredMockAlerts = filteredMockAlerts.filter(alert => 
              alert.type === filter.type
            );
          }
          
          if (filter.severity) {
            filteredMockAlerts = filteredMockAlerts.filter(alert => 
              alert.severity === filter.severity
            );
          }
          
          setAlerts(filteredMockAlerts);
          setError("This is a demonstration with mock data. The monitoring API is still in development.");
        }
      } catch (err) {
        console.error('Error in alert handling:', err);
        setError('Failed to process alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressRegistration = async () => {
    if (!addressInput || !addressInput.trim()) {
      setRegistrationStatus({
        message: 'Please enter a valid blockchain address',
        type: 'error'
      });
      return;
    }

    try {
      // Try to register with the real API
      await axios.post('/api/routes/monitoring/register/address', {
        user_id: 'demo_user',
        address: addressInput.trim()
      });
      
      setRegistrationStatus({
        message: 'Address registered successfully!',
        type: 'success'
      });
      setAddressInput('');
      
      // Add a mock alert for demonstration
      const newMockAlert = {
        id: `mock-address-${Date.now()}`,
        type: "whale_transaction",
        title: "Address Registration Confirmed",
        description: `The address ${addressInput.trim().substring(0, 8)}... has been registered for monitoring. You will receive alerts for any suspicious activity related to this address.`,
        source: "Monitoring Dashboard",
        severity: "low",
        timestamp: new Date().toISOString(),
        affected_protocols: [],
        affected_addresses: [addressInput.trim()]
      };
      
      setAlerts(prev => [newMockAlert, ...prev]);
    } catch (err) {
      console.error('Error registering address:', err);
      setRegistrationStatus({
        message: 'Failed to register address. This is a demonstration - address would be registered in production.',
        type: 'error'
      });
    }
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setRegistrationStatus({ message: '', type: '' });
    }, 3000);
  };

  const handleProtocolRegistration = async () => {
    if (!protocolInput || !protocolInput.trim()) {
      setRegistrationStatus({
        message: 'Please enter a valid protocol name',
        type: 'error'
      });
      return;
    }

    try {
      // Try to register with the real API
      await axios.post('/api/routes/monitoring/register/protocol', {
        user_id: 'demo_user',
        protocol: protocolInput.trim()
      });
      
      setRegistrationStatus({
        message: 'Protocol registered successfully!',
        type: 'success'
      });
      setProtocolInput('');
      
      // Add a mock alert for demonstration
      const newMockAlert = {
        id: `mock-protocol-${Date.now()}`,
        type: "security_news",
        title: "Protocol Registration Confirmed",
        description: `The protocol ${protocolInput.trim()} has been registered for monitoring. You will receive alerts for any security news or vulnerabilities related to this protocol.`,
        source: "Monitoring Dashboard",
        severity: "low",
        timestamp: new Date().toISOString(),
        affected_protocols: [protocolInput.trim()],
        affected_addresses: []
      };
      
      setAlerts(prev => [newMockAlert, ...prev]);
    } catch (err) {
      console.error('Error registering protocol:', err);
      setRegistrationStatus({
        message: 'Failed to register protocol. This is a demonstration - protocol would be registered in production.',
        type: 'error'
      });
    }
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setRegistrationStatus({ message: '', type: '' });
    }, 3000);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Blockchain & News Monitoring
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor blockchain activity, track whale movements, and receive security alerts in real-time.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Alerts Section */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Security Alerts
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="type-filter-label">Alert Type</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    id="type-filter"
                    name="type"
                    value={filter.type}
                    label="Alert Type"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="whale_transaction">Whale Transactions</MenuItem>
                    <MenuItem value="unusual_activity">Unusual Activity</MenuItem>
                    <MenuItem value="vulnerable_contract">Vulnerable Contracts</MenuItem>
                    <MenuItem value="security_news">Security News</MenuItem>
                    <MenuItem value="protocol_compromise">Protocol Compromise</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="severity-filter-label">Severity</InputLabel>
                  <Select
                    labelId="severity-filter-label"
                    id="severity-filter"
                    name="severity"
                    value={filter.severity}
                    label="Severity"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error && !alerts.length ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : alerts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No alerts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alerts will appear here when suspicious activity is detected
                </Typography>
              </Box>
            ) : (
              <Box>
                {error && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {alerts.length} alerts
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => setLoading(false), 500);
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
                <Box>
                  {alerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Registration Section */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              mb: 3
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Register for Alerts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {registrationStatus.message && (
              <Alert 
                severity={registrationStatus.type === 'success' ? 'success' : 'error'} 
                sx={{ mb: 2 }}
              >
                {registrationStatus.message}
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Monitor Address
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Receive alerts for suspicious activity related to a specific blockchain address.
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter blockchain address"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleAddressRegistration}
                fullWidth
              >
                Register Address
              </Button>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Monitor Protocol
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Receive alerts for security news and vulnerabilities related to a specific protocol.
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter protocol name"
                value={protocolInput}
                onChange={(e) => setProtocolInput(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleProtocolRegistration}
                fullWidth
              >
                Register Protocol
              </Button>
            </Box>
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Monitoring Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Blockchain Monitoring</Typography>
                <Chip 
                  label="Active" 
                  size="small" 
                  sx={{ 
                    bgcolor: theme.palette.success.light, 
                    color: theme.palette.success.dark,
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">News Monitoring</Typography>
                <Chip 
                  label="Active" 
                  size="small" 
                  sx={{ 
                    bgcolor: theme.palette.success.light, 
                    color: theme.palette.success.dark,
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Last Updated</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleString()}
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 500);
              }}
            >
              Refresh Data
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonitoringDashboard; 