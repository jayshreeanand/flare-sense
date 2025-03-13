import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import MonitorIcon from '@mui/icons-material/Monitor';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const FeatureCard = ({ icon, title, description }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 60,
          borderRadius: 2,
          bgcolor: `${theme.palette.primary.main}15`,
          color: theme.palette.primary.main,
          mb: 3
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
};

const LandingPage = ({ onGetStarted }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #512da8 100%)',
          color: 'white',
          pt: { xs: 10, md: 15 },
          pb: { xs: 12, md: 18 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            zIndex: 1
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            zIndex: 1
          }} 
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold"
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Secure Your DeFi Assets with AI-Powered Monitoring
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 'normal',
                  opacity: 0.9
                }}
              >
                FlareSense provides real-time blockchain monitoring, security alerts, and AI-powered risk analysis to protect your digital assets.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={onGetStarted}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  }
                }}
              >
                Get Started
              </Button>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img"
                src="https://via.placeholder.com/600x400?text=FlareSense+Dashboard"
                alt="FlareSense Dashboard"
                sx={{ 
                  width: '100%',
                  borderRadius: 3,
                  boxShadow: '0 15px 50px rgba(0,0,0,0.3)',
                  transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            Key Features
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 'normal'
            }}
          >
            Our comprehensive suite of tools helps you stay ahead of security threats and monitor your blockchain assets.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<SecurityIcon fontSize="large" />}
              title="Smart Contract Analysis"
              description="Analyze smart contracts for vulnerabilities and security risks before interacting with them."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<MonitorIcon fontSize="large" />}
              title="Real-time Monitoring"
              description="Monitor blockchain activity, whale movements, and unusual transactions in real-time."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<NotificationsActiveIcon fontSize="large" />}
              title="Personalized Alerts"
              description="Receive instant notifications about security threats affecting your monitored addresses and protocols."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<AnalyticsIcon fontSize="large" />}
              title="Risk Analytics"
              description="Get AI-powered insights and risk assessments to make informed decisions about your DeFi investments."
            />
          </Grid>
        </Grid>
      </Container>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
          py: 10
        }}
      >
        <Container maxWidth="md">
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              textAlign: 'center',
              background: 'white',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Ready to Secure Your DeFi Assets?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Start monitoring your blockchain assets and get real-time security alerts to protect your investments from threats.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={onGetStarted}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                py: 1.5,
                px: 4,
                borderRadius: 2
              }}
            >
              Get Started Now
            </Button>
          </Paper>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper',
          py: 4,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            color="text.secondary"
            align="center"
          >
            © {new Date().getFullYear()} FlareSense. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 