"""
Blockchain Monitoring Module

This module provides functionality to monitor blockchain activity for:
- Whale transactions (large value transfers)
- Unusual withdrawal patterns
- Smart contract interactions with known vulnerable contracts
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple

import structlog
from web3 import Web3
from web3.types import BlockData, TxData

from flare_ai_defai.blockchain import FlareProvider
from flare_ai_defai.settings import settings

logger = structlog.get_logger(__name__)

# Constants for monitoring
WHALE_THRESHOLD = Web3.to_wei(10000, "ether")  # 10,000 FLR
UNUSUAL_TX_COUNT_THRESHOLD = 50  # Number of transactions in a short period
UNUSUAL_TX_TIME_WINDOW = 300  # 5 minutes in seconds


class BlockchainMonitor:
    """
    Monitor blockchain activity for suspicious or notable events.
    
    This class provides methods to:
    - Track large transactions (whale movements)
    - Detect unusual withdrawal patterns
    - Monitor interactions with known vulnerable contracts
    """

    def __init__(self, blockchain_provider: Optional[FlareProvider] = None):
        """
        Initialize the blockchain monitor.
        
        Args:
            blockchain_provider: Optional FlareProvider instance. If not provided,
                                a new instance will be created using settings.
        """
        self.blockchain = blockchain_provider or FlareProvider(
            web3_provider_url=settings.web3_provider_url
        )
        self.web3 = self.blockchain.w3
        
        # Store known vulnerable contracts
        self.vulnerable_contracts: Set[str] = set()
        
        # Cache for tracking recent transactions by address
        self._address_tx_cache: Dict[str, List[Tuple[int, float]]] = {}
        
        # Last processed block
        self.last_processed_block = 0
        
        logger.info("Blockchain monitor initialized", provider=settings.web3_provider_url)

    async def start_monitoring(self, poll_interval: int = 15):
        """
        Start the blockchain monitoring process.
        
        Args:
            poll_interval: Time in seconds between blockchain checks
        """
        logger.info("Starting blockchain monitoring", poll_interval=poll_interval)
        
        while True:
            try:
                await self._process_new_blocks()
                # Clean up old cache entries
                self._clean_tx_cache()
            except Exception as e:
                logger.error("Error in blockchain monitoring", error=str(e))
            
            await asyncio.sleep(poll_interval)

    async def _process_new_blocks(self):
        """Process new blocks since the last check."""
        current_block = self.web3.eth.block_number
        
        if self.last_processed_block == 0:
            # First run, just process the latest block
            self.last_processed_block = current_block - 1
        
        if current_block <= self.last_processed_block:
            logger.debug("No new blocks to process")
            return
        
        logger.info(
            "Processing new blocks", 
            from_block=self.last_processed_block + 1, 
            to_block=current_block
        )
        
        # Process each block
        for block_num in range(self.last_processed_block + 1, current_block + 1):
            block = self.web3.eth.get_block(block_num, full_transactions=True)
            await self._analyze_block(block)
        
        self.last_processed_block = current_block

    async def _analyze_block(self, block: BlockData):
        """
        Analyze a block for notable transactions.
        
        Args:
            block: The block data with full transaction details
        """
        if not block or not hasattr(block, "transactions"):
            return
        
        for tx in block.transactions:
            # Check for whale transactions
            if self._is_whale_transaction(tx):
                await self._report_whale_transaction(tx, block.timestamp)
            
            # Track transaction for unusual activity detection
            self._track_address_transaction(tx)
            
            # Check for interactions with vulnerable contracts
            if self._is_vulnerable_contract_interaction(tx):
                await self._report_vulnerable_interaction(tx, block.timestamp)

    def _is_whale_transaction(self, tx: TxData) -> bool:
        """
        Check if a transaction is a whale transaction.
        
        Args:
            tx: Transaction data
            
        Returns:
            bool: True if the transaction value exceeds the whale threshold
        """
        return tx.value >= WHALE_THRESHOLD

    def _is_vulnerable_contract_interaction(self, tx: TxData) -> bool:
        """
        Check if a transaction interacts with a known vulnerable contract.
        
        Args:
            tx: Transaction data
            
        Returns:
            bool: True if the transaction interacts with a vulnerable contract
        """
        if not tx.to:
            return False
        
        return tx.to.lower() in self.vulnerable_contracts

    def _track_address_transaction(self, tx: TxData):
        """
        Track a transaction for an address to detect unusual patterns.
        
        Args:
            tx: Transaction data
        """
        if not tx.from_:
            return
        
        address = tx.from_.lower()
        current_time = time.time()
        
        if address not in self._address_tx_cache:
            self._address_tx_cache[address] = []
        
        self._address_tx_cache[address].append((tx.value, current_time))
        
        # Check for unusual activity
        if self._detect_unusual_activity(address):
            asyncio.create_task(self._report_unusual_activity(address, tx))

    def _detect_unusual_activity(self, address: str) -> bool:
        """
        Detect if an address has unusual transaction activity.
        
        Args:
            address: The address to check
            
        Returns:
            bool: True if unusual activity is detected
        """
        if address not in self._address_tx_cache:
            return False
        
        tx_list = self._address_tx_cache[address]
        current_time = time.time()
        
        # Count transactions in the time window
        recent_tx_count = sum(
            1 for _, tx_time in tx_list 
            if current_time - tx_time <= UNUSUAL_TX_TIME_WINDOW
        )
        
        return recent_tx_count >= UNUSUAL_TX_COUNT_THRESHOLD

    def _clean_tx_cache(self):
        """Clean up old entries from the transaction cache."""
        current_time = time.time()
        cutoff_time = current_time - UNUSUAL_TX_TIME_WINDOW
        
        for address in list(self._address_tx_cache.keys()):
            # Keep only transactions within the time window
            self._address_tx_cache[address] = [
                (value, tx_time) for value, tx_time in self._address_tx_cache[address]
                if tx_time >= cutoff_time
            ]
            
            # Remove empty lists
            if not self._address_tx_cache[address]:
                del self._address_tx_cache[address]

    async def update_vulnerable_contracts(self, contracts: List[str]):
        """
        Update the list of known vulnerable contracts.
        
        Args:
            contracts: List of contract addresses (will be converted to lowercase)
        """
        self.vulnerable_contracts = {addr.lower() for addr in contracts}
        logger.info(
            "Updated vulnerable contracts list", 
            count=len(self.vulnerable_contracts)
        )

    async def _report_whale_transaction(self, tx: TxData, timestamp: int):
        """
        Report a whale transaction.
        
        Args:
            tx: Transaction data
            timestamp: Block timestamp
        """
        value_eth = Web3.from_wei(tx.value, "ether")
        
        logger.info(
            "Whale transaction detected",
            tx_hash=tx.hash.hex(),
            from_address=tx.from_,
            to_address=tx.to,
            value=float(value_eth),
            timestamp=datetime.fromtimestamp(timestamp).isoformat(),
        )
        
        # This would be expanded to send to the alert service

    async def _report_unusual_activity(self, address: str, tx: TxData):
        """
        Report unusual activity for an address.
        
        Args:
            address: The address with unusual activity
            tx: A recent transaction from this address
        """
        logger.info(
            "Unusual transaction activity detected",
            address=address,
            recent_tx_count=len(self._address_tx_cache[address]),
            latest_tx_hash=tx.hash.hex(),
        )
        
        # This would be expanded to send to the alert service

    async def _report_vulnerable_interaction(self, tx: TxData, timestamp: int):
        """
        Report interaction with a vulnerable contract.
        
        Args:
            tx: Transaction data
            timestamp: Block timestamp
        """
        logger.warning(
            "Interaction with vulnerable contract detected",
            tx_hash=tx.hash.hex(),
            from_address=tx.from_,
            vulnerable_contract=tx.to,
            timestamp=datetime.fromtimestamp(timestamp).isoformat(),
        )
        
        # This would be expanded to send to the alert service 