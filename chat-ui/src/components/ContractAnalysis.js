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

const MarkdownContent = styled(Box)(({ theme }) => ({
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
  '& h1': { fontSize: '2rem' },
  '& h2': { fontSize: '1.8rem' },
  '& h3': { fontSize: '1.6rem' },
  '& h4': { fontSize: '1.4rem' },
  '& h5': { fontSize: '1.2rem' },
  '& h6': { fontSize: '1.1rem' },
  '& p': {
    marginBottom: theme.spacing(2),
    lineHeight: 1.6,
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(1),
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
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
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Smart Contract Security Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="example-contract-label">Example Contracts</InputLabel>
                  <Select
                    labelId="example-contract-label"
                    value={selectedExample}
                    label="Example Contracts"
                    onChange={handleExampleChange}
                  >
                    <MenuItem value="none">Custom Contract</MenuItem>
                    <MenuItem value="vulnerablePool">Vulnerable Flare Pool</MenuItem>
                    <MenuItem value="securePool">Secure Flare Pool</MenuItem>
                    <MenuItem value="ftsoExample">Flare Price Oracle</MenuItem>
                  </Select>
                </FormControl>
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
                    <Divider sx={{ mb: 2 }} />
                    <MarkdownContent>
                      <ReactMarkdown>{analysis.overall_assessment}</ReactMarkdown>
                    </MarkdownContent>
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