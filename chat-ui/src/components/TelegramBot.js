import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Tooltip,
  Link
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import MonitoringIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import HelpIcon from '@mui/icons-material/Help';
import TelegramIcon from '@mui/icons-material/Telegram';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Sample data for quick demos
const SAMPLE_ADDRESSES = [
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "0x28c6c06298d514db089934071355e5743bf21d60",
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549"
];

const SAMPLE_PROTOCOLS = [
  "Uniswap",
  "Aave",
  "Compound"
];

const TelegramBot = () => {
  const [chatId, setChatId] = useState('');
  const [protocol, setProtocol] = useState('');
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [monitoredProtocols, setMonitoredProtocols] = useState([]);
  const [monitoredAddresses, setMonitoredAddresses] = useState([]);
  const theme = useTheme();

  // Check if user has previously connected
  useEffect(() => {
    const savedChatId = localStorage.getItem('telegram_chat_id');
    const savedIsConnected = localStorage.getItem('telegram_is_connected');
    const savedIsSubscribed = localStorage.getItem('telegram_is_subscribed');
    const savedProtocols = localStorage.getItem('telegram_monitored_protocols');
    const savedAddresses = localStorage.getItem('telegram_monitored_addresses');
    
    if (savedChatId) {
      setChatId(savedChatId);
    }
    
    if (savedIsConnected === 'true') {
      setIsConnected(true);
    }
    
    if (savedIsSubscribed === 'true') {
      setIsSubscribed(true);
    }
    
    if (savedProtocols) {
      try {
        setMonitoredProtocols(JSON.parse(savedProtocols));
      } catch (e) {
        console.error('Error parsing saved protocols', e);
      }
    }
    
    if (savedAddresses) {
      try {
        setMonitoredAddresses(JSON.parse(savedAddresses));
      } catch (e) {
        console.error('Error parsing saved addresses', e);
      }
    }
  }, []);

  const handleCopyCommand = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Copied to clipboard!');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleConnect = () => {
    if (!chatId) {
      setStatusMessage({
        type: 'error',
        message: 'Please enter your Telegram Chat ID'
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnected(true);
      setStatusMessage({
        type: 'success',
        message: 'Successfully connected to Telegram!'
      });
      localStorage.setItem('telegram_chat_id', chatId);
      localStorage.setItem('telegram_is_connected', 'true');
      setLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnected(false);
      setIsSubscribed(false);
      setStatusMessage({
        type: 'info',
        message: 'Disconnected from Telegram'
      });
      localStorage.removeItem('telegram_is_connected');
      localStorage.removeItem('telegram_is_subscribed');
      setLoading(false);
    }, 1000);
  };

  const handleSubscribe = async () => {
    if (!isConnected) {
      setStatusMessage({
        type: 'error',
        message: 'Please connect to Telegram first'
      });
      return;
    }

    setLoading(true);
    try {
      // Try to call the real API
      const response = await axios.post('/api/routes/monitoring/telegram/subscribe', {
        chat_id: parseInt(chatId, 10)
      });
      
      setIsSubscribed(true);
      setStatusMessage({
        type: 'success',
        message: response.data?.message || 'Successfully subscribed to alerts!'
      });
      localStorage.setItem('telegram_is_subscribed', 'true');
    } catch (error) {
      console.error('Error subscribing:', error);
      
      // Fallback to simulation for demo
      setIsSubscribed(true);
      setStatusMessage({
        type: 'success',
        message: 'Successfully subscribed to alerts! (Demo mode)'
      });
      localStorage.setItem('telegram_is_subscribed', 'true');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!isConnected) {
      setStatusMessage({
        type: 'error',
        message: 'Please connect to Telegram first'
      });
      return;
    }

    setLoading(true);
    try {
      // Try to call the real API
      const response = await axios.post('/api/routes/monitoring/telegram/unsubscribe', {
        chat_id: parseInt(chatId, 10)
      });
      
      setIsSubscribed(false);
      setStatusMessage({
        type: 'info',
        message: response.data?.message || 'Unsubscribed from alerts'
      });
      localStorage.removeItem('telegram_is_subscribed');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      
      // Fallback to simulation for demo
      setIsSubscribed(false);
      setStatusMessage({
        type: 'info',
        message: 'Unsubscribed from alerts (Demo mode)'
      });
      localStorage.removeItem('telegram_is_subscribed');
    } finally {
      setLoading(false);
    }
  };

  const handleMonitorProtocol = async () => {
    if (!isConnected || !protocol) {
      setStatusMessage({
        type: 'error',
        message: !isConnected ? 'Please connect to Telegram first' : 'Please enter a protocol name'
      });
      return;
    }

    setLoading(true);
    try {
      // Try to call the real API
      const response = await axios.post(`/api/routes/monitoring/telegram/monitor/protocol?protocol=${encodeURIComponent(protocol)}`, {
        chat_id: parseInt(chatId, 10)
      });
      
      // Add to monitored protocols
      if (!monitoredProtocols.includes(protocol)) {
        const updatedProtocols = [...monitoredProtocols, protocol];
        setMonitoredProtocols(updatedProtocols);
        localStorage.setItem('telegram_monitored_protocols', JSON.stringify(updatedProtocols));
      }
      
      setStatusMessage({
        type: 'success',
        message: response.data?.message || `Now monitoring protocol: ${protocol}`
      });
      setProtocol('');
    } catch (error) {
      console.error('Error monitoring protocol:', error);
      
      // Fallback to simulation for demo
      if (!monitoredProtocols.includes(protocol)) {
        const updatedProtocols = [...monitoredProtocols, protocol];
        setMonitoredProtocols(updatedProtocols);
        localStorage.setItem('telegram_monitored_protocols', JSON.stringify(updatedProtocols));
      }
      
      setStatusMessage({
        type: 'success',
        message: `Now monitoring protocol: ${protocol} (Demo mode)`
      });
      setProtocol('');
    } finally {
      setLoading(false);
    }
  };

  const handleMonitorAddress = async () => {
    if (!isConnected || !address) {
      setStatusMessage({
        type: 'error',
        message: !isConnected ? 'Please connect to Telegram first' : 'Please enter a blockchain address'
      });
      return;
    }

    setLoading(true);
    try {
      // Try to call the real API
      const response = await axios.post(`/api/routes/monitoring/telegram/monitor/address?address=${encodeURIComponent(address)}`, {
        chat_id: parseInt(chatId, 10)
      });
      
      // Add to monitored addresses
      if (!monitoredAddresses.includes(address)) {
        const updatedAddresses = [...monitoredAddresses, address];
        setMonitoredAddresses(updatedAddresses);
        localStorage.setItem('telegram_monitored_addresses', JSON.stringify(updatedAddresses));
      }
      
      setStatusMessage({
        type: 'success',
        message: response.data?.message || `Now monitoring address: ${address}`
      });
      setAddress('');
    } catch (error) {
      console.error('Error monitoring address:', error);
      
      // Fallback to simulation for demo
      if (!monitoredAddresses.includes(address)) {
        const updatedAddresses = [...monitoredAddresses, address];
        setMonitoredAddresses(updatedAddresses);
        localStorage.setItem('telegram_monitored_addresses', JSON.stringify(updatedAddresses));
      }
      
      setStatusMessage({
        type: 'success',
        message: `Now monitoring address: ${address} (Demo mode)`
      });
      setAddress('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProtocol = (protocol) => {
    const updatedProtocols = monitoredProtocols.filter(p => p !== protocol);
    setMonitoredProtocols(updatedProtocols);
    localStorage.setItem('telegram_monitored_protocols', JSON.stringify(updatedProtocols));
    
    setStatusMessage({
      type: 'info',
      message: `Stopped monitoring protocol: ${protocol}`
    });
  };

  const handleRemoveAddress = (address) => {
    const updatedAddresses = monitoredAddresses.filter(a => a !== address);
    setMonitoredAddresses(updatedAddresses);
    localStorage.setItem('telegram_monitored_addresses', JSON.stringify(updatedAddresses));
    
    setStatusMessage({
      type: 'info',
      message: `Stopped monitoring address: ${address}`
    });
  };

  const handleOpenQRDialog = () => {
    setOpenQRDialog(true);
  };

  const handleCloseQRDialog = () => {
    setOpenQRDialog(false);
  };

  const renderConnectionSection = () => (
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
          Connect to Telegram
        </Typography>
        <Chip 
          icon={isConnected ? <CheckCircleIcon /> : <ErrorIcon />} 
          label={isConnected ? "Connected" : "Not Connected"} 
          color={isConnected ? "success" : "default"}
          variant="outlined"
        />
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {isConnected ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are connected to the FlareSense Telegram bot with Chat ID: <strong>{chatId}</strong>
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleDisconnect}
            disabled={loading}
            startIcon={<NotificationsOffIcon />}
          >
            Disconnect
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" paragraph>
            Connect your Telegram account to receive real-time security alerts and interact with the FlareSense bot.
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Step 1: Find your Chat ID
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleOpenQRDialog}
                  fullWidth
                  sx={{ mb: 1 }}
                  startIcon={<TelegramIcon />}
                >
                  Scan QR Code to Message @userinfobot
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Send a message to @userinfobot on Telegram to get your Chat ID
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Step 2: Enter your Chat ID
                </Typography>
                <TextField
                  fullWidth
                  label="Your Telegram Chat ID"
                  variant="outlined"
                  size="small"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="e.g., 123456789"
                  sx={{ mb: 1 }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleConnect}
                  disabled={loading || !chatId}
                  fullWidth
                  startIcon={<TelegramIcon />}
                >
                  Connect to Telegram
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {statusMessage && (
        <Alert 
          severity={statusMessage.type}
          sx={{ mt: 2 }}
          onClose={() => setStatusMessage(null)}
        >
          {statusMessage.message}
        </Alert>
      )}
    </Paper>
  );

  const renderFeaturesSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
            height: '100%'
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Alert Subscription
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" paragraph>
              Subscribe to receive real-time security alerts for blockchain activity and DeFi protocols.
            </Typography>
            
            {isSubscribed ? (
              <Button 
                variant="outlined" 
                color="warning"
                onClick={handleUnsubscribe}
                disabled={loading || !isConnected}
                startIcon={<NotificationsOffIcon />}
                fullWidth
              >
                Unsubscribe from Alerts
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubscribe}
                disabled={loading || !isConnected}
                startIcon={<NotificationsActiveIcon />}
                fullWidth
              >
                Subscribe to Alerts
              </Button>
            )}
          </Box>
          
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Available Bot Commands
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <TelegramIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="/start" 
                secondary="Get started with the bot" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <NotificationsActiveIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="/subscribe" 
                secondary="Subscribe to alerts" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <NotificationsOffIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="/unsubscribe" 
                secondary="Unsubscribe from alerts" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SecurityIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="/risk <contract_address>" 
                secondary="Get risk assessment for a contract" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <NewspaperIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="/news" 
                secondary="Get latest DeFi security news" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HelpIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="/help" 
                secondary="Show available commands" 
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
            height: '100%'
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Monitoring Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Monitor Protocol
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                label="Protocol Name"
                variant="outlined"
                size="small"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                placeholder="e.g., Uniswap"
                disabled={!isConnected}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleMonitorProtocol}
                disabled={loading || !isConnected || !protocol}
                startIcon={<MonitoringIcon />}
              >
                Monitor
              </Button>
            </Box>
            
            {monitoredProtocols.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Monitored Protocols:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {monitoredProtocols.map((p, index) => (
                    <Chip 
                      key={index}
                      label={p}
                      onDelete={() => handleRemoveProtocol(p)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Monitor Address
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Blockchain Address"
                variant="outlined"
                size="small"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                disabled={!isConnected}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleMonitorAddress}
                disabled={loading || !isConnected || !address}
                startIcon={<MonitoringIcon />}
              >
                Monitor
              </Button>
            </Box>
            
            {monitoredAddresses.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Monitored Addresses:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {monitoredAddresses.map((a, index) => (
                    <Chip 
                      key={index}
                      label={`${a.substring(0, 6)}...${a.substring(a.length - 4)}`}
                      onDelete={() => handleRemoveAddress(a)}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      title={a}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Telegram Bot Integration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Receive real-time security alerts and interact with FlareSense directly through Telegram.
        </Typography>
      </Box>
      
      {renderConnectionSection()}
      
      {renderFeaturesSection()}
      
      <Dialog open={openQRDialog} onClose={handleCloseQRDialog}>
        <DialogTitle>Scan QR Code with Telegram</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Scan this QR code with your phone to open a chat with @userinfobot on Telegram. 
            Send any message to the bot to get your Chat ID.
          </DialogContentText>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <QRCodeSVG 
              value="https://t.me/userinfobot" 
              size={200}
              level="H"
              includeMargin={true}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            Or click this link: <Link href="https://t.me/userinfobot" target="_blank" rel="noopener">https://t.me/userinfobot</Link>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQRDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TelegramBot; 