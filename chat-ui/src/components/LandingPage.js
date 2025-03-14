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
  
  // Create a CSS-based dashboard preview
  const DashboardPreview = () => (
    <Box
      sx={{
        width: '100%',
        height: 400,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #2196f3 0%, #512da8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 15px 50px rgba(0,0,0,0.3)',
        transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          FlareSense Dashboard
        </Typography>
        <Box sx={{ height: 10, width: '70%', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1, mb: 2 }} />
        <Box sx={{ height: 10, width: '50%', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1, mb: 2 }} />
        
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} key={item}>
              <Box sx={{ 
                height: 80, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ height: 8, width: '60%', bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
                <Box sx={{ height: 20, width: '40%', bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Box sx={{ height: 100, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
        </Box>
      </Box>
    </Box>
  );
  
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };
  
  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          pt: 12,
          pb: 8,
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
                Flare Sense : DeFAI Security Agent
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 'normal',
                  opacity: 0.9
                }}
              >
                FlareSense improves DeFi security by detecting risks, suggesting fixes, and sending live alerts. Using real-time security data, blockchain monitoring, RAG, and consensus learning to keep users and protocols safe.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleGetStarted}
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
              {/* Use the CSS-based dashboard preview */}
              <DashboardPreview />
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
            Our comprehensive suite of tools helps you stay ahead of security threats and monitor your blockchain assets with AI-powered insights.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<SecurityIcon fontSize="large" />}
              title="Smart Contract Analysis"
              description="Analyze smart contracts for vulnerabilities and security risks with detailed reports and actionable recommendations."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<MonitorIcon fontSize="large" />}
              title="Real-time Monitoring"
              description="Monitor blockchain activity, whale movements, and unusual transactions with customizable alerts for addresses and protocols."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<NotificationsActiveIcon fontSize="large" />}
              title="Security Alerts"
              description="Receive instant notifications about security threats, vulnerabilities, and DeFi security news affecting your assets."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard 
              icon={<AnalyticsIcon fontSize="large" />}
              title="Risk Assessment"
              description="Get AI-powered risk scores and detailed threat analysis for smart contracts, protocols, and addresses."
            />
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard 
              icon={<Box component="span" sx={{ fontSize: '1.5rem' }}>🤖</Box>}
              title="AI Chat Interface"
              description="Interact with all features through a conversational AI interface using natural language commands."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard 
              icon={<Box component="span" sx={{ fontSize: '1.5rem' }}>📱</Box>}
              title="Telegram Integration"
              description="Manage alerts, monitor assets, and query risk scores directly through Telegram."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard 
              icon={<Box component="span" sx={{ fontSize: '1.5rem' }}>🔒</Box>}
              title="Secure Execution"
              description="All operations run in a Trusted Execution Environment (TEE) with attestation support."
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
              onClick={handleGetStarted}
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