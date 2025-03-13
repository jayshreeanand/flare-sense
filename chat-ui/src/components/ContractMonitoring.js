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
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const riskColors = {
  HIGH: '#ff1744',
  MEDIUM: '#ff9100',
  LOW: '#00c853',
};

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ContractMonitoring = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [numBlocks, setNumBlocks] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState(null);

  const handleMonitor = async () => {
    if (!contractAddress) {
      setError('Please provide a contract address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/routes/contracts/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_address: contractAddress,
          num_blocks: parseInt(numBlocks, 10),
        }),
      });

      if (!response.ok) {
        throw new Error('Monitoring failed');
      }

      const result = await response.json();
      setActivities(result);
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
          Contract Activity Monitoring
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <TextField
                  label="Contract Address"
                  fullWidth
                  margin="normal"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                />
                <TextField
                  label="Number of Blocks to Analyze"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={numBlocks}
                  onChange={(e) => setNumBlocks(e.target.value)}
                  inputProps={{ min: 1, max: 10000 }}
                />
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMonitor}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Monitor Contract'
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

          {activities && activities.length > 0 ? (
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Suspicious Activities Detected
                  </Typography>
                  <List>
                    {activities.map((activity, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1">
                                {activity.type}
                              </Typography>
                              <Chip
                                label={activity.risk_level}
                                size="small"
                                sx={{
                                  backgroundColor: riskColors[activity.risk_level],
                                  color: 'white',
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" paragraph>
                                {activity.description}
                              </Typography>
                              <Typography variant="body2" color="primary">
                                Recommendation: {activity.recommendation}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </StyledCard>
            </Grid>
          ) : activities && activities.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="success">
                No suspicious activities detected in the analyzed blocks.
              </Alert>
            </Grid>
          ) : null}
        </Grid>
      </Box>
    </Container>
  );
};

export default ContractMonitoring; 