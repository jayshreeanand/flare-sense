import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const severityColors = {
  CRITICAL: '#ff1744',
  HIGH: '#f50057',
  MEDIUM: '#ff9100',
  LOW: '#00c853',
};

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const RiskScore = styled(Box)(({ theme, score }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: (() => {
    if (score >= 75) return '#ffebee';
    if (score >= 50) return '#fff3e0';
    if (score >= 25) return '#f1f8e9';
    return '#e8f5e9';
  })(),
  borderRadius: theme.shape.borderRadius,
}));

const ContractAnalysis = () => {
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!contractCode || !contractName) {
      setError('Please provide both contract code and name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/routes/contracts/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_code: contractCode,
          contract_name: contractName,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Smart Contract Security Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <TextField
                  label="Contract Name"
                  fullWidth
                  margin="normal"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                />
                <TextField
                  label="Contract Code"
                  fullWidth
                  multiline
                  rows={10}
                  margin="normal"
                  value={contractCode}
                  onChange={(e) => setContractCode(e.target.value)}
                />
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Analyze Contract'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {analysis && (
            <>
              <Grid item xs={12} md={4}>
                <RiskScore score={analysis.risk_score}>
                  <Typography variant="h6">Risk Score</Typography>
                  <Typography variant="h3" color="text.secondary">
                    {Math.round(analysis.risk_score)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {analysis.risk_score >= 75
                      ? 'Critical Risk'
                      : analysis.risk_score >= 50
                      ? 'High Risk'
                      : analysis.risk_score >= 25
                      ? 'Medium Risk'
                      : 'Low Risk'}
                  </Typography>
                </RiskScore>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Vulnerabilities
                  </Typography>
                  <List>
                    {analysis.vulnerabilities.map((vuln, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1">{vuln.name}</Typography>
                              <Chip
                                label={vuln.severity}
                                size="small"
                                sx={{
                                  backgroundColor: severityColors[vuln.severity],
                                  color: 'white',
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" paragraph>
                                {vuln.description}
                              </Typography>
                              <Typography variant="body2" color="primary">
                                Fix: {vuln.fix_recommendation}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Gas Optimization Suggestions
                    </Typography>
                    <List>
                      {analysis.gas_optimization_suggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overall Assessment
                    </Typography>
                    <Typography variant="body1">
                      {analysis.overall_assessment}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default ContractAnalysis; 