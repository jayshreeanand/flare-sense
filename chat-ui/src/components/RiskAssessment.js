import React, { useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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

const RiskLevelBadge = ({ level }) => {
  const theme = useTheme();
  
  const getColor = () => {
    switch (level.toLowerCase()) {
      case 'critical':
        return {
          bg: theme.palette.error.light,
          text: theme.palette.error.dark,
          icon: '🔴'
        };
      case 'high':
        return {
          bg: theme.palette.error.light,
          text: theme.palette.error.dark,
          icon: '🔴'
        };
      case 'medium':
        return {
          bg: theme.palette.warning.light,
          text: theme.palette.warning.dark,
          icon: '⚠️'
        };
      case 'low':
        return {
          bg: theme.palette.info.light,
          text: theme.palette.info.dark,
          icon: 'ℹ️'
        };
      default:
        return {
          bg: theme.palette.grey[100],
          text: theme.palette.grey[800],
          icon: 'ℹ️'
        };
    }
  };

  const { bg, text, icon } = getColor();

  return (
    <Chip
      icon={<Box component="span" sx={{ mr: 0.5, fontSize: '1rem' }}>{icon}</Box>}
      label={level.toUpperCase()}
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

const RiskCategoryIcon = ({ category }) => {
  const theme = useTheme();
  
  const getIconInfo = () => {
    switch (category.toLowerCase()) {
      case 'smart_contract_vulnerability':
        return {
          icon: '🔓',
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      case 'protocol_design_flaw':
        return {
          icon: '⚙️',
          color: theme.palette.warning.main,
          bg: `${theme.palette.warning.main}15`
        };
      case 'centralization_risk':
        return {
          icon: '🏢',
          color: theme.palette.warning.main,
          bg: `${theme.palette.warning.main}15`
        };
      case 'economic_attack_vector':
        return {
          icon: '💰',
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      case 'oracle_manipulation':
        return {
          icon: '🔮',
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      case 'governance_risk':
        return {
          icon: '🏛️',
          color: theme.palette.warning.main,
          bg: `${theme.palette.warning.main}15`
        };
      case 'liquidity_risk':
        return {
          icon: '💧',
          color: theme.palette.info.main,
          bg: `${theme.palette.info.main}15`
        };
      case 'flash_loan_attack_vector':
        return {
          icon: '⚡',
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      case 'reentrancy_vulnerability':
        return {
          icon: '🔄',
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      case 'access_control_issue':
        return {
          icon: '🔑',
          color: theme.palette.error.main,
          bg: `${theme.palette.error.main}15`
        };
      default:
        return {
          icon: '❓',
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
        mr: 2,
        fontSize: '1.5rem'
      }}
    >
      {icon}
    </Box>
  );
};

const FindingCard = ({ finding }) => {
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
        <RiskCategoryIcon category={finding.category} />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {finding.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RiskLevelBadge level={finding.level} />
              <Chip 
                label={`${Math.round(finding.confidence * 100)}% confidence`}
                size="small"
                sx={{ 
                  ml: 1, 
                  bgcolor: theme.palette.grey[100],
                  color: theme.palette.grey[800]
                }}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {finding.description}
          </Typography>
          
          <Accordion 
            disableGutters 
            elevation={0}
            sx={{ 
              '&:before': { display: 'none' },
              bgcolor: 'transparent',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              mb: 2
            }}
          >
            <AccordionSummary
              expandIcon={<Box component="span" sx={{ fontSize: '1.2rem' }}>⌄</Box>}
            >
              <Typography variant="body2" fontWeight="bold">
                Recommendation
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {finding.recommendation}
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Sources: {finding.sources.join(', ')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const RiskAssessment = () => {
  const [targetType, setTargetType] = useState('contract');
  const [targetId, setTargetId] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!targetId.trim()) {
      setError('Please enter a target ID (contract address, protocol name, etc.)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to call the real API
      const response = await axios.post('/api/routes/risk-assessment/assess', {
        target_type: targetType,
        target_id: targetId.trim(),
        additional_context: additionalContext.trim() || undefined
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Error in risk assessment:', err);
      
      // For demonstration, generate mock data if the API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for demonstration');
        
        // Generate mock assessment result
        const mockResult = {
          target_type: targetType,
          target_id: targetId.trim(),
          overall_risk_level: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          findings: [
            {
              category: 'reentrancy_vulnerability',
              level: 'high',
              title: 'Reentrancy Vulnerability in Withdraw Function',
              description: 'The withdraw function calls external contracts after state changes, which could allow an attacker to recursively call back into the function and drain funds.',
              recommendation: 'Implement the checks-effects-interactions pattern. Move all external calls to the end of the function after all state changes have been made.',
              confidence: 0.92,
              sources: ['AI Model', 'Security Database']
            },
            {
              category: 'access_control_issue',
              level: 'medium',
              title: 'Insufficient Access Controls',
              description: 'Critical functions lack proper access control mechanisms, allowing unauthorized users to execute privileged operations.',
              recommendation: 'Implement proper access control modifiers and ensure they are applied to all sensitive functions.',
              confidence: 0.85,
              sources: ['AI Model']
            },
            {
              category: 'oracle_manipulation',
              level: 'medium',
              title: 'Price Oracle Manipulation Risk',
              description: 'The contract relies on a single price oracle source which could be manipulated in a flash loan attack.',
              recommendation: 'Use a time-weighted average price (TWAP) or multiple oracle sources to mitigate manipulation risks.',
              confidence: 0.78,
              sources: ['AI Model', 'Historical Data']
            }
          ],
          summary: 'The assessment identified several security concerns, including a high-risk reentrancy vulnerability and medium-risk access control issues. These vulnerabilities could potentially lead to loss of funds or unauthorized access to contract functionality.',
          timestamp: new Date().toISOString(),
          metadata: {
            model_count: 3,
            context_length: 1250
          }
        };
        
        setResult(mockResult);
      } else {
        setError(`Failed to perform risk assessment: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          AI-Powered Risk Assessment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze smart contracts, protocols, and addresses for security risks using advanced AI models with RAG knowledge and consensus learning.
        </Typography>
      </Box>

      {!result ? (
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
            New Assessment
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="target-type-label">Target Type</InputLabel>
                  <Select
                    labelId="target-type-label"
                    id="target-type"
                    value={targetType}
                    label="Target Type"
                    onChange={(e) => setTargetType(e.target.value)}
                  >
                    <MenuItem value="contract">Smart Contract</MenuItem>
                    <MenuItem value="protocol">Protocol</MenuItem>
                    <MenuItem value="address">Blockchain Address</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={targetType === 'contract' ? 'Contract Address' : 
                         targetType === 'protocol' ? 'Protocol Name' : 'Blockchain Address'}
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder={targetType === 'contract' ? '0x1234...' : 
                               targetType === 'protocol' ? 'Uniswap, Aave, etc.' : '0x1234...'}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Context (Optional)"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any additional information that might be relevant for the assessment..."
                  multiline
                  rows={4}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Assess Risk'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      ) : (
        <Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Risk Assessment Results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(result.timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                onClick={handleReset}
                startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>←</Box>}
              >
                New Assessment
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Target
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {result.target_type === 'contract' ? 'Smart Contract: ' : 
                     result.target_type === 'protocol' ? 'Protocol: ' : 'Address: '}
                    <Box component="span" sx={{ fontFamily: 'monospace' }}>
                      {result.target_id}
                    </Box>
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="body1">
                    {result.summary}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    bgcolor: result.overall_risk_level === 'critical' || result.overall_risk_level === 'high' 
                      ? `${theme.palette.error.main}10` 
                      : result.overall_risk_level === 'medium' 
                        ? `${theme.palette.warning.main}10`
                        : `${theme.palette.success.main}10`,
                    border: `1px solid ${
                      result.overall_risk_level === 'critical' || result.overall_risk_level === 'high' 
                        ? theme.palette.error.main 
                        : result.overall_risk_level === 'medium' 
                          ? theme.palette.warning.main
                          : theme.palette.success.main
                    }20`,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Overall Risk Level
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    <RiskLevelBadge level={result.overall_risk_level} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Based on consensus from {result.metadata.model_count} AI models
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Detailed Findings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {result.findings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <IconWrapper color={theme.palette.success.main}>✓</IconWrapper>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    No security issues found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The assessment did not identify any significant security risks
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {result.findings.map((finding, index) => (
                    <FindingCard key={index} finding={finding} />
                  ))}
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={handleReset}
                startIcon={<Box component="span" sx={{ fontSize: '1rem' }}>←</Box>}
              >
                New Assessment
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
      
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
          About AI-Powered Risk Assessment
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                RAG Knowledge Base
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our system leverages a comprehensive knowledge base of past security incidents, audit reports, and best practices to provide context-aware risk assessments.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Multiple AI Models
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We use multiple state-of-the-art AI models to analyze each target, ensuring a more robust assessment and reducing false positives.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Consensus Learning
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our system aggregates findings from multiple models using consensus learning techniques, prioritizing issues that multiple models agree on.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Comprehensive Coverage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The assessment covers a wide range of security risks, from smart contract vulnerabilities to economic attack vectors and governance risks.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RiskAssessment; 