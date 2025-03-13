"""
Alert Service Module

This module provides functionality to manage alerts and notifications for:
- Blockchain activity alerts (whale transactions, unusual withdrawals)
- Security news alerts (hacks, exploits, vulnerabilities)
- User-specific alerts (protocols they've interacted with)
"""

import asyncio
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Coroutine, Optional, Protocol, Dict, List

import structlog
from pydantic import BaseModel

from flare_ai_defai.settings import settings

logger = structlog.get_logger(__name__)


class AlertType(str, Enum):
    """Types of alerts that can be generated."""
    
    WHALE_TRANSACTION = "whale_transaction"
    UNUSUAL_ACTIVITY = "unusual_activity"
    VULNERABLE_CONTRACT = "vulnerable_contract"
    SECURITY_NEWS = "security_news"
    PROTOCOL_COMPROMISE = "protocol_compromise"


class AlertSeverity(str, Enum):
    """Severity levels for alerts."""
    
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Alert(BaseModel):
    """Model for alerts."""
    
    id: str
    type: AlertType
    title: str
    description: str
    source: str
    severity: AlertSeverity
    timestamp: datetime
    metadata: Dict[str, Any] = {}
    affected_addresses: List[str] = []
    affected_protocols: List[str] = []


class AlertHandler(Protocol):
    """Protocol for alert handlers."""
    
    async def handle_alert(self, alert: Alert) -> None:
        """Handle an alert."""
        ...


class AlertService:
    """
    Service for managing alerts and notifications.
    
    This class provides methods to:
    - Register alert handlers
    - Process and distribute alerts
    - Track user-specific alerts
    """

    def __init__(self):
        """Initialize the alert service."""
        self.handlers: Dict[AlertType, List[AlertHandler]] = {}
        self.user_protocols: Dict[str, List[str]] = {}  # user_id -> list of protocols
        self.user_addresses: Dict[str, List[str]] = {}  # user_id -> list of addresses
        self.alert_history: List[Alert] = []
        
        logger.info("Alert service initialized")

    def register_handler(self, alert_type: AlertType, handler: AlertHandler) -> None:
        """
        Register a handler for a specific alert type.
        
        Args:
            alert_type: The type of alert to handle
            handler: The handler to register
        """
        if alert_type not in self.handlers:
            self.handlers[alert_type] = []
        
        self.handlers[alert_type].append(handler)
        logger.info(
            "Registered alert handler", 
            alert_type=alert_type, 
            handler=handler.__class__.__name__
        )

    async def process_alert(self, alert: Alert) -> None:
        """
        Process an alert and distribute it to registered handlers.
        
        Args:
            alert: The alert to process
        """
        # Store in history
        self.alert_history.append(alert)
        
        # Log the alert
        logger.info(
            "Processing alert",
            alert_id=alert.id,
            type=alert.type,
            title=alert.title,
            severity=alert.severity,
        )
        
        # Distribute to handlers
        handlers = self.handlers.get(alert.type, [])
        
        if not handlers:
            logger.warning("No handlers registered for alert type", type=alert.type)
            return
        
        # Process with all handlers
        tasks = [handler.handle_alert(alert) for handler in handlers]
        await asyncio.gather(*tasks)
        
        # Check for user-specific notifications
        await self._check_user_notifications(alert)

    async def _check_user_notifications(self, alert: Alert) -> None:
        """
        Check if any users should be notified about this alert.
        
        Args:
            alert: The alert to check
        """
        affected_users = set()
        
        # Check for affected protocols
        for protocol in alert.affected_protocols:
            for user_id, protocols in self.user_protocols.items():
                if protocol in protocols:
                    affected_users.add(user_id)
                    logger.info(
                        "User affected by protocol alert",
                        user_id=user_id,
                        protocol=protocol,
                        alert_id=alert.id,
                    )
        
        # Check for affected addresses
        for address in alert.affected_addresses:
            for user_id, addresses in self.user_addresses.items():
                if address in addresses:
                    affected_users.add(user_id)
                    logger.info(
                        "User affected by address alert",
                        user_id=user_id,
                        address=address,
                        alert_id=alert.id,
                    )
        
        # Notify affected users
        for user_id in affected_users:
            await self._notify_user(user_id, alert)

    async def _notify_user(self, user_id: str, alert: Alert) -> None:
        """
        Notify a user about an alert.
        
        Args:
            user_id: The user ID to notify
            alert: The alert to notify about
        """
        # This would be expanded to send notifications via various channels
        logger.info(
            "Notifying user about alert",
            user_id=user_id,
            alert_id=alert.id,
            title=alert.title,
        )

    def register_user_protocol(self, user_id: str, protocol: str) -> None:
        """
        Register a protocol that a user has interacted with.
        
        Args:
            user_id: The user ID
            protocol: The protocol name
        """
        if user_id not in self.user_protocols:
            self.user_protocols[user_id] = []
        
        if protocol not in self.user_protocols[user_id]:
            self.user_protocols[user_id].append(protocol)
            logger.info(
                "Registered user protocol interaction",
                user_id=user_id,
                protocol=protocol,
            )

    def register_user_address(self, user_id: str, address: str) -> None:
        """
        Register an address that a user has used.
        
        Args:
            user_id: The user ID
            address: The blockchain address
        """
        if user_id not in self.user_addresses:
            self.user_addresses[user_id] = []
        
        if address not in self.user_addresses[user_id]:
            self.user_addresses[user_id].append(address)
            logger.info(
                "Registered user address",
                user_id=user_id,
                address=address,
            )

    def get_alerts_for_user(self, user_id: str) -> list[Alert]:
        """
        Get all alerts relevant to a specific user.
        
        Args:
            user_id: The user ID
            
        Returns:
            List of alerts relevant to this user
        """
        if user_id not in self.user_protocols and user_id not in self.user_addresses:
            return []
        
        user_protocols = self.user_protocols.get(user_id, [])
        user_addresses = self.user_addresses.get(user_id, [])
        
        relevant_alerts = []
        
        for alert in self.alert_history:
            # Check if any protocols match
            if any(protocol in alert.affected_protocols for protocol in user_protocols):
                relevant_alerts.append(alert)
                continue
            
            # Check if any addresses match
            if any(address in alert.affected_addresses for address in user_addresses):
                relevant_alerts.append(alert)
                continue
        
        return relevant_alerts


# Example alert handlers

class ConsoleAlertHandler:
    """Alert handler that logs alerts to the console."""
    
    async def handle_alert(self, alert: Alert) -> None:
        """
        Handle an alert by logging it to the console.
        
        Args:
            alert: The alert to handle
        """
        logger.warning(
            "ALERT",
            id=alert.id,
            type=alert.type,
            title=alert.title,
            severity=alert.severity,
            timestamp=alert.timestamp.isoformat(),
        )


class WebhookAlertHandler:
    """Alert handler that sends alerts to a webhook."""
    
    def __init__(self, webhook_url: str):
        """
        Initialize the webhook alert handler.
        
        Args:
            webhook_url: The URL to send webhooks to
        """
        self.webhook_url = webhook_url
    
    async def handle_alert(self, alert: Alert) -> None:
        """
        Handle an alert by sending it to a webhook.
        
        Args:
            alert: The alert to handle
        """
        # This would be expanded to actually send the webhook
        logger.info(
            "Would send webhook",
            url=self.webhook_url,
            alert_id=alert.id,
        ) 