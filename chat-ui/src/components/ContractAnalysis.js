import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const severityColors = {
  CRITICAL: '#ff1744',
  HIGH: '#f50057',
  MEDIUM: '#ff9100',
  LOW: '#00c853',
};

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.02),
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: '12px',
  '& .MuiOutlinedInput-notchedOutline': {
    transition: 'all 0.2s ease-in-out',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const AnalyzeButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const RiskScore = styled(motion.div)(({ theme, score }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  backgroundColor: (() => {
    if (score >= 75) return alpha('#ff1744', 0.1);
    if (score >= 50) return alpha('#f50057', 0.1);
    if (score >= 25) return alpha('#ff9100', 0.1);
    return alpha('#00c853', 0.1);
  })(),
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  backdropFilter: 'blur(8px)',
}));

const VulnerabilityCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

// Example contracts
const EXAMPLE_CONTRACTS = {
  none: {
    name: '',
    code: '',
  },
  vulnerablePool: {
    name: 'VulnerableFlarePool',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VulnerableFlarePool is Ownable {
    mapping(address => uint256) public userBalances;
    IERC20 public flareToken;
    uint256 public lastPrice;
    
    constructor(address _flareToken) {
        flareToken = IERC20(_flareToken);
    }
    
    // Vulnerability 1: No reentrancy guard
    function withdraw(uint256 amount) external {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        // Potential reentrancy vulnerability
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    // Vulnerability 2: Unchecked return value
    function deposit(uint256 amount) external {
        flareToken.transferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender] += amount;
    }
    
    // Vulnerability 3: Price oracle manipulation risk
    function updatePrice(uint256 newPrice) external {
        // No access control or validation
        lastPrice = newPrice;
    }
    
    // Vulnerability 4: Integer overflow potential
    function addReward(uint256 reward) external {
        userBalances[msg.sender] += reward;
    }
    
    // Vulnerability 5: Unprotected FTSO usage
    function getFTSOPrice(string calldata symbol) external view returns (uint256) {
        // Missing proper FTSO integration and validation
        return lastPrice;
    }
    
    // Emergency function but with time delay vulnerability
    uint256 public unlockTime;
    function setEmergencyUnlock(uint256 _unlockTime) external onlyOwner {
        unlockTime = _unlockTime;
    }
    
    function emergencyWithdraw() external onlyOwner {
        require(block.timestamp >= unlockTime, "Too early");
        payable(owner()).transfer(address(this).balance);
    }
}`,
  },
  securePool: {
    name: 'SecureFlarePool',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SecureFlarePool is Ownable, ReentrancyGuard, Pausable {
    mapping(address => uint256) public userBalances;
    IERC20 public immutable flareToken;
    
    // FTSO price feed interface
    IFtso public immutable ftso;
    uint256 public lastPrice;
    uint256 public constant PRICE_VALID_DURATION = 5 minutes;
    uint256 public lastPriceTimestamp;
    
    // Emergency withdrawal settings
    uint256 public constant MAX_UNLOCK_DELAY = 7 days;
    uint256 public unlockTime;
    
    event PriceUpdated(uint256 price, uint256 timestamp);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor(address _flareToken, address _ftso) {
        require(_flareToken != address(0), "Invalid token address");
        require(_ftso != address(0), "Invalid FTSO address");
        flareToken = IERC20(_flareToken);
        ftso = IFtso(_ftso);
    }
    
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        userBalances[msg.sender] -= amount;
        
        // Transfer tokens before state changes
        require(flareToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }
    
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be positive");
        
        // Use safe transfer from
        require(flareToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        userBalances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }
    
    function updatePrice() external {
        (uint256 price, uint256 timestamp, bool valid) = ftso.getCurrentPrice();
        require(valid, "Invalid price data");
        require(block.timestamp - timestamp <= PRICE_VALID_DURATION, "Price too old");
        
        lastPrice = price;
        lastPriceTimestamp = timestamp;
        emit PriceUpdated(price, timestamp);
    }
    
    function getPrice() external view returns (uint256, uint256) {
        require(block.timestamp - lastPriceTimestamp <= PRICE_VALID_DURATION, "Price too old");
        return (lastPrice, lastPriceTimestamp);
    }
    
    function setEmergencyUnlock(uint256 _unlockTime) external onlyOwner {
        require(_unlockTime <= block.timestamp + MAX_UNLOCK_DELAY, "Unlock time too far");
        unlockTime = _unlockTime;
    }
    
    function emergencyWithdraw() external onlyOwner {
        require(block.timestamp >= unlockTime, "Too early");
        require(paused(), "Contract must be paused");
        
        uint256 balance = flareToken.balanceOf(address(this));
        require(flareToken.transfer(owner(), balance), "Transfer failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

interface IFtso {
    function getCurrentPrice() external view returns (uint256 price, uint256 timestamp, bool valid);
}`,
  },
  ftsoExample: {
    name: 'FlarePriceOracle',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FlarePriceOracle is Ownable, ReentrancyGuard {
    // FTSO Registry interface
    IFtsoRegistry public immutable ftsoRegistry;
    
    // Supported symbols and their FTSO indices
    mapping(string => uint256) public symbolIndices;
    mapping(string => bool) public supportedSymbols;
    
    // Price cache to prevent excessive FTSO calls
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 decimals;
    }
    mapping(string => PriceData) public priceCache;
    
    // Constants
    uint256 public constant PRICE_VALID_DURATION = 5 minutes;
    
    // Events
    event PriceUpdated(string symbol, uint256 price, uint256 timestamp);
    event SymbolAdded(string symbol, uint256 index);
    event SymbolRemoved(string symbol);
    
    constructor(address _ftsoRegistry) {
        require(_ftsoRegistry != address(0), "Invalid registry address");
        ftsoRegistry = IFtsoRegistry(_ftsoRegistry);
    }
    
    function addSymbol(string calldata symbol, uint256 ftsoIndex) external onlyOwner {
        require(!supportedSymbols[symbol], "Symbol already supported");
        require(ftsoIndex < ftsoRegistry.getFtsoCount(), "Invalid FTSO index");
        
        symbolIndices[symbol] = ftsoIndex;
        supportedSymbols[symbol] = true;
        emit SymbolAdded(symbol, ftsoIndex);
    }
    
    function removeSymbol(string calldata symbol) external onlyOwner {
        require(supportedSymbols[symbol], "Symbol not supported");
        
        delete symbolIndices[symbol];
        delete supportedSymbols[symbol];
        delete priceCache[symbol];
        emit SymbolRemoved(symbol);
    }
    
    function updatePrice(string calldata symbol) external nonReentrant {
        require(supportedSymbols[symbol], "Symbol not supported");
        
        IFtso ftso = IFtso(ftsoRegistry.getFtsoByIndex(symbolIndices[symbol]));
        (uint256 price, uint256 timestamp, bool valid) = ftso.getCurrentPrice();
        require(valid, "Invalid price data");
        
        priceCache[symbol] = PriceData({
            price: price,
            timestamp: timestamp,
            decimals: ftso.ASSET_PRICE_USD_DECIMALS()
        });
        
        emit PriceUpdated(symbol, price, timestamp);
    }
    
    function getPrice(string calldata symbol) external view returns (uint256 price, uint256 timestamp, uint256 decimals) {
        require(supportedSymbols[symbol], "Symbol not supported");
        
        PriceData memory data = priceCache[symbol];
        require(data.timestamp > 0, "Price not initialized");
        require(block.timestamp - data.timestamp <= PRICE_VALID_DURATION, "Price too old");
        
        return (data.price, data.timestamp, data.decimals);
    }
    
    function getPriceWithoutCheck(string calldata symbol) external view returns (uint256 price, uint256 timestamp, uint256 decimals) {
        require(supportedSymbols[symbol], "Symbol not supported");
        PriceData memory data = priceCache[symbol];
        return (data.price, data.timestamp, data.decimals);
    }
}

interface IFtsoRegistry {
    function getFtsoByIndex(uint256 _ftsoIndex) external view returns (address);
    function getFtsoCount() external view returns (uint256);
}

interface IFtso {
    function getCurrentPrice() external view returns (uint256 _price, uint256 _timestamp, bool _valid);
    function ASSET_PRICE_USD_DECIMALS() external view returns (uint256);
}`,
  },
};

const ContractAnalysis = () => {
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [selectedExample, setSelectedExample] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleExampleChange = (event) => {
    const example = EXAMPLE_CONTRACTS[event.target.value];
    setSelectedExample(event.target.value);
    setContractName(example.name);
    setContractCode(example.code);
  };

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
      <Box my={6}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4
            }}
          >
            Smart Contract Security Analysis
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StyledCard>
                <CardContent sx={{ p: 4 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="example-contract-label">Example Contracts</InputLabel>
                    <StyledSelect
                      labelId="example-contract-label"
                      value={selectedExample}
                      label="Example Contracts"
                      onChange={handleExampleChange}
                    >
                      <MenuItem value="none">Custom Contract</MenuItem>
                      <MenuItem value="vulnerablePool">Vulnerable Flare Pool</MenuItem>
                      <MenuItem value="securePool">Secure Flare Pool</MenuItem>
                      <MenuItem value="ftsoExample">Flare Price Oracle</MenuItem>
                    </StyledSelect>
                  </FormControl>
                  <StyledTextField
                    label="Contract Name"
                    fullWidth
                    margin="normal"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                  />
                  <StyledTextField
                    label="Contract Code"
                    fullWidth
                    multiline
                    rows={10}
                    margin="normal"
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                      },
                    }}
                  />
                  <Box mt={4} display="flex" justifyContent="center">
                    <AnalyzeButton
                      variant="contained"
                      color="primary"
                      onClick={handleAnalyze}
                      disabled={loading}
                      startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    >
                      {loading ? 'Analyzing...' : 'Analyze Contract'}
                    </AnalyzeButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error"
                  sx={{ 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            </Grid>
          )}

          {analysis && (
            <>
              <Grid item xs={12} md={4}>
                <RiskScore
                  score={analysis.risk_score}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Risk Score</Typography>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700,
                      color: (() => {
                        if (analysis.risk_score >= 75) return severityColors.CRITICAL;
                        if (analysis.risk_score >= 50) return severityColors.HIGH;
                        if (analysis.risk_score >= 25) return severityColors.MEDIUM;
                        return severityColors.LOW;
                      })(),
                    }}
                  >
                    {Math.round(analysis.risk_score)}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mt: 1,
                      fontWeight: 500,
                      color: 'text.secondary'
                    }}
                  >
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
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Vulnerabilities
                  </Typography>
                  <List>
                    {analysis.vulnerabilities.map((vuln, index) => (
                      <VulnerabilityCard
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>{vuln.name}</Typography>
                                <Chip
                                  label={vuln.severity}
                                  size="small"
                                  sx={{
                                    backgroundColor: severityColors[vuln.severity],
                                    color: 'white',
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box mt={1}>
                                <Typography variant="body1" paragraph>
                                  {vuln.description}
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    mt: 1
                                  }}
                                >
                                  Fix: {vuln.fix_recommendation}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </VulnerabilityCard>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Gas Optimization Suggestions
                    </Typography>
                    <List>
                      {analysis.gas_optimization_suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <ListItem>
                            <ListItemText 
                              primary={suggestion}
                              sx={{
                                '& .MuiTypography-root': {
                                  fontSize: '1.1rem',
                                },
                              }}
                            />
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12}>
                <StyledCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Overall Assessment
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ReactMarkdown>{analysis.overall_assessment}</ReactMarkdown>
                    </motion.div>
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