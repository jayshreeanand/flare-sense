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
  ButtonGroup,
  Tooltip,
  LinearProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Note: You need to install recharts with: npm install recharts
// Import recharts components for gas analysis visualization
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

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

// Sample data for quick demos
const SAMPLE_CONTRACTS = [
  {
    name: "Simple ERC20 Token",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name = "Simple Token";
    string public symbol = "SMPL";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10 ** uint256(decimals);
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
}`
  },
  {
    name: "Vulnerable Reentrancy Contract",
    address: "0x9876543210abcdef9876543210abcdef98765432",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // Vulnerable to reentrancy attack
    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        
        balances[msg.sender] -= _amount;
    }
    
    function getBalance() public view returns (uint) {
        return balances[msg.sender];
    }
}`
  },
  {
    name: "Simple NFT Contract",
    address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleNFT {
    struct NFT {
        string name;
        string description;
        address owner;
    }
    
    NFT[] public nfts;
    mapping(uint => address) public nftToOwner;
    mapping(address => uint) public ownerNFTCount;
    
    event Transfer(address indexed from, address indexed to, uint indexed tokenId);
    
    function createNFT(string memory _name, string memory _description) public {
        uint id = nfts.length;
        nfts.push(NFT(_name, _description, msg.sender));
        nftToOwner[id] = msg.sender;
        ownerNFTCount[msg.sender]++;
        emit Transfer(address(0), msg.sender, id);
    }
    
    function transferNFT(address _to, uint _tokenId) public {
        require(nftToOwner[_tokenId] == msg.sender, "Not the owner");
        require(_to != address(0), "Transfer to zero address");
        
        ownerNFTCount[msg.sender]--;
        ownerNFTCount[_to]++;
        nftToOwner[_tokenId] = _to;
        nfts[_tokenId].owner = _to;
        
        emit Transfer(msg.sender, _to, _tokenId);
    }
    
    function getNFTsByOwner(address _owner) public view returns(uint[] memory) {
        uint[] memory result = new uint[](ownerNFTCount[_owner]);
        uint counter = 0;
        
        for (uint i = 0; i < nfts.length; i++) {
            if (nftToOwner[i] == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        
        return result;
    }
}`
  }
];

// Sample analysis results for demo purposes
const sampleAnalysisResults = [
  // ERC20 Token Analysis
  {
    contractName: "FlareToken",
    securityScore: 85,
    vulnerabilities: [
      {
        name: "Centralization Risk",
        severity: "Medium",
        description: "The contract has a single owner with privileged access to critical functions like withdraw() and setTokenPrice().",
        location: "Lines 25-27, 33-35",
        recommendation: "Consider implementing a multi-signature wallet or DAO governance for critical functions."
      },
      {
        name: "Price Manipulation Risk",
        severity: "Low",
        description: "The owner can change the token price at any time, which could potentially be used to manipulate the market.",
        location: "Lines 17-19",
        recommendation: "Implement time locks or gradual price change mechanisms to prevent sudden price changes."
      }
    ],
    gasAnalysis: {
      totalGasUsed: 2450000,
      functionBreakdown: [
        { name: "constructor", gas: 1200000 },
        { name: "buyTokens", gas: 650000 },
        { name: "withdraw", gas: 35000 },
        { name: "setTokenPrice", gas: 45000 },
        { name: "toggleSale", gas: 45000 }
      ]
    },
    codeQuality: {
      score: 90,
      comments: "The contract follows good practices by using OpenZeppelin's standard implementations. Code is well-structured and readable."
    }
  },
  // Vulnerable Bank Analysis
  {
    contractName: "VulnerableBank",
    securityScore: 40,
    vulnerabilities: [
      {
        name: "Reentrancy Vulnerability",
        severity: "Critical",
        description: "The withdraw function sends ETH before updating the user's balance, making it vulnerable to reentrancy attacks.",
        location: "Lines 13-16",
        recommendation: "Follow the checks-effects-interactions pattern: update the balance before sending ETH."
      },
      {
        name: "No Access Control",
        severity: "Medium",
        description: "The contract lacks access control mechanisms for administrative functions.",
        location: "Entire contract",
        recommendation: "Implement proper access control using modifiers or role-based systems."
      },
      {
        name: "No Event Emissions",
        severity: "Low",
        description: "The contract does not emit events for important state changes, making it difficult to track off-chain.",
        location: "Entire contract",
        recommendation: "Add events for deposit and withdraw operations."
      }
    ],
    gasAnalysis: {
      totalGasUsed: 120000,
      functionBreakdown: [
        { name: "deposit", gas: 45000 },
        { name: "withdraw", gas: 60000 },
        { name: "getBalance", gas: 15000 }
      ]
    },
    codeQuality: {
      score: 60,
      comments: "The contract is simple but lacks important security features and best practices. Documentation is minimal."
    }
  },
  // Simple NFT Analysis
  {
    contractName: "SimpleNFT",
    securityScore: 75,
    vulnerabilities: [
      {
        name: "Front-Running Vulnerability",
        severity: "Medium",
        description: "The mint function can be front-run by attackers to secure specific token IDs.",
        location: "Lines 29-41",
        recommendation: "Consider implementing a commit-reveal scheme or batch minting to prevent front-running."
      },
      {
        name: "Centralization Risk",
        severity: "Medium",
        description: "The contract has a single owner with privileged access to critical functions.",
        location: "Entire contract",
        recommendation: "Consider implementing a multi-signature wallet or DAO governance for critical functions."
      }
    ],
    gasAnalysis: {
      totalGasUsed: 3200000,
      functionBreakdown: [
        { name: "constructor", gas: 1500000 },
        { name: "mint", gas: 1500000 },
        { name: "withdraw", gas: 35000 },
        { name: "setMintPrice", gas: 45000 },
        { name: "toggleMinting", gas: 45000 }
      ]
    },
    codeQuality: {
      score: 85,
      comments: "The contract follows good practices by using OpenZeppelin's standard implementations. Code is well-structured with adequate documentation."
    }
  }
];

const ContractAnalysis = () => {
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [selectedExample, setSelectedExample] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [contractAddress, setContractAddress] = useState('');

  // Sample contracts for demo purposes
  const sampleContracts = [
    {
      name: "FlareToken",
      address: "0x1234567890123456789012345678901234567890",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlareToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public tokenPrice = 0.0001 ether;
    bool public saleActive = false;

    constructor() ERC20("FlareToken", "FLARE") {
        // Mint 20% of tokens to the contract creator
        _mint(msg.sender, MAX_SUPPLY / 5);
    }

    function setTokenPrice(uint256 _newPrice) external onlyOwner {
        tokenPrice = _newPrice;
    }

    function toggleSale() external onlyOwner {
        saleActive = !saleActive;
    }

    function buyTokens() external payable {
        require(saleActive, "Token sale is not active");
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        uint256 tokensToBuy = (msg.value * 10**18) / tokenPrice;
        require(totalSupply() + tokensToBuy <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(msg.sender, tokensToBuy);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`
    },
    {
      name: "VulnerableBank",
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Vulnerable: sends ETH before updating balance
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
    }
    
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}`
    },
    {
      name: "SimpleNFT",
      address: "0x9876543210fedcba9876543210fedcba98765432",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    uint256 public mintPrice = 0.05 ether;
    uint256 public maxSupply = 10000;
    bool public mintingEnabled = false;
    
    constructor() ERC721("SimpleNFT", "SNFT") {}
    
    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }
    
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
    }
    
    function mint(string memory tokenURI) public payable returns (uint256) {
        require(mintingEnabled, "Minting is not enabled");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        return newItemId;
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}`
    }
  ];

  // Function to load sample contract data
  const handleLoadSampleContract = (index) => {
    if (index >= 0 && index < sampleContracts.length) {
      const sample = sampleContracts[index];
      setContractName(sample.name);
      setContractAddress(sample.address);
      setContractCode(sample.code);
      setSelectedExample('');
      setAnalysis(null);
      setError('');
    }
  };

  const handleExampleChange = (event) => {
    const example = EXAMPLE_CONTRACTS[event.target.value];
    setSelectedExample(event.target.value);
    setContractName(example.name);
    setContractCode(example.code);
  };

  const handleAnalyze = async () => {
    if (!contractCode) {
      setError('Please enter contract code or select an example');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, if we're using a sample contract, return the corresponding sample analysis
      const sampleIndex = sampleContracts.findIndex(sample => 
        sample.code === contractCode && sample.address === contractAddress
      );
      
      if (sampleIndex !== -1) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAnalysis(sampleAnalysisResults[sampleIndex]);
        setLoading(false);
        return;
      }
      
      // If not a sample contract, make the actual API call
      const response = await fetch('http://localhost:8080/api/routes/analysis/contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_code: contractCode,
          contract_address: contractAddress || undefined,
          contract_name: contractName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze contract: ${err.message}`);
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
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Contract Details
                    </Typography>
                    <Box>
                      <Tooltip title="Load sample contract for demo purposes">
                        <ButtonGroup size="small" variant="outlined">
                          <Button 
                            onClick={() => handleLoadSampleContract(0)}
                            sx={{ textTransform: 'none' }}
                          >
                            ERC20 Token
                          </Button>
                          <Button 
                            onClick={() => handleLoadSampleContract(1)}
                            sx={{ textTransform: 'none' }}
                          >
                            Vulnerable Bank
                          </Button>
                          <Button 
                            onClick={() => handleLoadSampleContract(2)}
                            sx={{ textTransform: 'none' }}
                          >
                            Simple NFT
                          </Button>
                        </ButtonGroup>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

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
                  score={analysis.securityScore}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Security Score</Typography>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 700,
                      color: (() => {
                        const score = analysis.securityScore;
                        if (score < 50) return severityColors.CRITICAL;
                        if (score < 70) return severityColors.HIGH;
                        if (score < 85) return severityColors.MEDIUM;
                        return severityColors.LOW;
                      })(),
                    }}
                  >
                    {Math.round(analysis.securityScore)}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mt: 1,
                      fontWeight: 500,
                      color: 'text.secondary'
                    }}
                  >
                    {analysis.securityScore < 50
                      ? 'Critical Risk'
                      : analysis.securityScore < 70
                      ? 'High Risk'
                      : analysis.securityScore < 85
                      ? 'Medium Risk'
                      : 'Low Risk'}
                  </Typography>
                </RiskScore>
              </Grid>

              <Grid item xs={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Code Quality</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={analysis.codeQuality.score}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            flexGrow: 1,
                            mr: 2,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            },
                          }}
                        />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {analysis.codeQuality.score}/100
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.codeQuality.comments}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Vulnerabilities</Typography>
                      {analysis.vulnerabilities.length === 0 ? (
                        <Alert severity="success">No vulnerabilities detected</Alert>
                      ) : (
                        <TableContainer component={Paper} elevation={0}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Severity</TableCell>
                                <TableCell>Vulnerability</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Recommendation</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {analysis.vulnerabilities.map((vuln, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Chip
                                      label={vuln.severity}
                                      size="small"
                                      sx={{
                                        backgroundColor: (() => {
                                          switch (vuln.severity) {
                                            case 'Critical': return severityColors.CRITICAL;
                                            case 'High': return severityColors.HIGH;
                                            case 'Medium': return severityColors.MEDIUM;
                                            default: return severityColors.LOW;
                                          }
                                        })(),
                                        color: 'white',
                                        fontWeight: 600,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>{vuln.name}</TableCell>
                                  <TableCell>{vuln.description}</TableCell>
                                  <TableCell>{vuln.location}</TableCell>
                                  <TableCell>{vuln.recommendation}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Gas Analysis</Typography>
                      
                      {/* Fallback for when recharts is not available */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Total Gas Used: <strong>{analysis.gasAnalysis.totalGasUsed.toLocaleString()}</strong>
                        </Typography>
                        
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Function Gas Breakdown:
                        </Typography>
                        
                        <TableContainer component={Paper} elevation={0}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Function</TableCell>
                                <TableCell align="right">Gas Used</TableCell>
                                <TableCell align="right">Percentage</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {analysis.gasAnalysis.functionBreakdown.map((func, index) => (
                                <TableRow key={index}>
                                  <TableCell component="th" scope="row">
                                    {func.name}
                                  </TableCell>
                                  <TableCell align="right">
                                    {func.gas.toLocaleString()}
                                  </TableCell>
                                  <TableCell align="right">
                                    {Math.round((func.gas / analysis.gasAnalysis.totalGasUsed) * 100)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                      
                      
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analysis.gasAnalysis.functionBreakdown}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end" 
                              height={70} 
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toLocaleString()} gas`} />
                            <Bar 
                              dataKey="gas" 
                              fill="#8884d8" 
                              name="Gas Used"
                              background={{ fill: '#eee' }}
                            >
                              {analysis.gasAnalysis.functionBreakdown.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={`hsl(${210 + index * 30}, 70%, 50%)`} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                      
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default ContractAnalysis; 