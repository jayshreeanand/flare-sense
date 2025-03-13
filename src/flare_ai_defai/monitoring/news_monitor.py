"""
News Monitoring Module

This module provides functionality to monitor DeFi security news and alerts from
various sources, including:
- Security blogs and Twitter accounts
- DeFi exploit announcements
- Protocol vulnerability disclosures
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set

import aiohttp
import structlog
from pydantic import BaseModel

from flare_ai_defai.settings import settings

logger = structlog.get_logger(__name__)

# News sources
NEWS_SOURCES = [
    {
        "name": "Rekt News",
        "url": "https://rekt.news/api/posts",
        "type": "api",
    },
    {
        "name": "BlockSec",
        "url": "https://blocksec.com/blog/feed",
        "type": "rss",
    },
    {
        "name": "PeckShield",
        "url": "https://twitter.com/peckshield",
        "type": "twitter",
    },
]


class SecurityAlert(BaseModel):
    """Model for security alerts."""
    
    id: str
    source: str
    title: str
    description: str
    url: str
    severity: str  # "high", "medium", "low"
    affected_protocols: list[str]
    published_at: datetime
    discovered_at: datetime


class NewsMonitor:
    """
    Monitor DeFi security news and alerts.
    
    This class provides methods to:
    - Fetch security news from various sources
    - Analyze news for security incidents
    - Track affected protocols
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the news monitor.
        
        Args:
            api_key: Optional API key for accessing news sources
        """
        self.api_key = api_key or settings.news_api_key
        self.session = None
        self.known_alerts: set[str] = set()  # Set of alert IDs we've already processed
        self.affected_protocols: dict[str, list[SecurityAlert]] = {}
        
        logger.info("News monitor initialized")

    async def start_monitoring(self, poll_interval: int = 300):
        """
        Start the news monitoring process.
        
        Args:
            poll_interval: Time in seconds between news checks (default: 5 minutes)
        """
        logger.info("Starting news monitoring", poll_interval=poll_interval)
        
        # Create HTTP session
        self.session = aiohttp.ClientSession()
        
        try:
            while True:
                try:
                    alerts = await self._fetch_security_news()
                    new_alerts = await self._process_alerts(alerts)
                    
                    if new_alerts:
                        logger.info("New security alerts detected", count=len(new_alerts))
                except Exception as e:
                    logger.error("Error in news monitoring", error=str(e))
                
                await asyncio.sleep(poll_interval)
        finally:
            # Clean up
            if self.session:
                await self.session.close()
                self.session = None

    async def _fetch_security_news(self) -> list[SecurityAlert]:
        """
        Fetch security news from all configured sources.
        
        Returns:
            List of security alerts
        """
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        all_alerts = []
        
        for source in NEWS_SOURCES:
            try:
                source_alerts = await self._fetch_from_source(source)
                all_alerts.extend(source_alerts)
            except Exception as e:
                logger.error(
                    "Error fetching from news source", 
                    source=source["name"], 
                    error=str(e)
                )
        
        return all_alerts

    async def _fetch_from_source(self, source: dict[str, Any]) -> list[SecurityAlert]:
        """
        Fetch alerts from a specific source.
        
        Args:
            source: Source configuration
            
        Returns:
            List of security alerts from this source
        """
        source_type = source["type"]
        
        if source_type == "api":
            return await self._fetch_from_api(source)
        elif source_type == "rss":
            return await self._fetch_from_rss(source)
        elif source_type == "twitter":
            return await self._fetch_from_twitter(source)
        else:
            logger.warning("Unknown source type", type=source_type)
            return []

    async def _fetch_from_api(self, source: dict[str, Any]) -> list[SecurityAlert]:
        """
        Fetch alerts from an API source.
        
        Args:
            source: Source configuration
            
        Returns:
            List of security alerts from this API
        """
        if not self.session:
            return []
        
        # This is a simplified implementation
        # In a real implementation, this would handle pagination, authentication, etc.
        async with self.session.get(source["url"]) as response:
            if response.status != 200:
                logger.error(
                    "API request failed", 
                    source=source["name"], 
                    status=response.status
                )
                return []
            
            data = await response.json()
            
            # This parsing would be customized for each API
            alerts = []
            for item in data.get("items", []):
                # Example parsing logic - would be customized for each API
                if "hack" in item.get("title", "").lower() or "exploit" in item.get("title", "").lower():
                    alert = SecurityAlert(
                        id=f"{source['name']}:{item.get('id')}",
                        source=source["name"],
                        title=item.get("title", "Unknown"),
                        description=item.get("description", ""),
                        url=item.get("url", source["url"]),
                        severity=self._determine_severity(item),
                        affected_protocols=self._extract_affected_protocols(item),
                        published_at=datetime.fromisoformat(item.get("published", datetime.now().isoformat())),
                        discovered_at=datetime.now(),
                    )
                    alerts.append(alert)
            
            return alerts

    async def _fetch_from_rss(self, source: dict[str, Any]) -> list[SecurityAlert]:
        """
        Fetch alerts from an RSS feed.
        
        Args:
            source: Source configuration
            
        Returns:
            List of security alerts from this RSS feed
        """
        # In a real implementation, this would parse RSS feeds
        # This is a placeholder
        logger.info("RSS fetching not fully implemented", source=source["name"])
        return []

    async def _fetch_from_twitter(self, source: dict[str, Any]) -> list[SecurityAlert]:
        """
        Fetch alerts from Twitter.
        
        Args:
            source: Source configuration
            
        Returns:
            List of security alerts from Twitter
        """
        # In a real implementation, this would use Twitter API
        # This is a placeholder
        logger.info("Twitter fetching not fully implemented", source=source["name"])
        return []

    def _determine_severity(self, item: dict[str, Any]) -> str:
        """
        Determine the severity of an alert based on its content.
        
        Args:
            item: The news item
            
        Returns:
            Severity level: "high", "medium", or "low"
        """
        # This is a simplified implementation
        # In a real implementation, this would use more sophisticated analysis
        title = item.get("title", "").lower()
        description = item.get("description", "").lower()
        
        if "critical" in title or "critical" in description:
            return "high"
        elif "hack" in title or "exploit" in title or "vulnerability" in title:
            return "high"
        elif "risk" in title or "warning" in description:
            return "medium"
        else:
            return "low"

    def _extract_affected_protocols(self, item: dict[str, Any]) -> list[str]:
        """
        Extract affected protocols from a news item.
        
        Args:
            item: The news item
            
        Returns:
            List of affected protocol names
        """
        # This is a simplified implementation
        # In a real implementation, this would use NLP or a more sophisticated approach
        title = item.get("title", "")
        description = item.get("description", "")
        
        # Example: look for protocol names in title
        protocols = []
        
        # List of common DeFi protocols to check for
        known_protocols = [
            "Uniswap", "Aave", "Compound", "MakerDAO", "Curve", "SushiSwap",
            "Balancer", "Yearn", "Synthetix", "dYdX", "Bancor", "1inch",
            "PancakeSwap", "Trader Joe", "Olympus", "Convex", "Lido"
        ]
        
        for protocol in known_protocols:
            if protocol.lower() in title.lower() or protocol.lower() in description.lower():
                protocols.append(protocol)
        
        return protocols

    async def _process_alerts(self, alerts: list[SecurityAlert]) -> list[SecurityAlert]:
        """
        Process new alerts and update affected protocols.
        
        Args:
            alerts: List of security alerts
            
        Returns:
            List of new alerts that haven't been processed before
        """
        new_alerts = []
        
        for alert in alerts:
            if alert.id in self.known_alerts:
                continue
            
            # This is a new alert
            self.known_alerts.add(alert.id)
            new_alerts.append(alert)
            
            # Update affected protocols
            for protocol in alert.affected_protocols:
                if protocol not in self.affected_protocols:
                    self.affected_protocols[protocol] = []
                
                self.affected_protocols[protocol].append(alert)
                
                logger.warning(
                    "Security alert for protocol",
                    protocol=protocol,
                    alert_title=alert.title,
                    severity=alert.severity,
                    source=alert.source,
                )
        
        return new_alerts

    async def get_alerts_for_protocol(self, protocol: str) -> list[SecurityAlert]:
        """
        Get all security alerts for a specific protocol.
        
        Args:
            protocol: Protocol name
            
        Returns:
            List of security alerts affecting this protocol
        """
        return self.affected_protocols.get(protocol.lower(), []) 