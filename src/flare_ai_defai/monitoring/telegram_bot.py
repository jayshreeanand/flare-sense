"""
Telegram Bot Integration for FlareSense

This module provides a Telegram bot handler for sending real-time alerts to users.
It allows users to subscribe to alerts, query contract risk scores, and get the latest
DeFi security news.
"""

import asyncio
import structlog
from typing import Dict, List, Optional, Set
import aiohttp
from datetime import datetime

from flare_ai_defai.monitoring.alert_service import Alert, AlertHandler
from flare_ai_defai.settings import settings

logger = structlog.get_logger(__name__)

class TelegramBotHandler(AlertHandler):
    """
    Alert handler that sends alerts to users via Telegram.
    
    This handler:
    - Manages user subscriptions
    - Sends real-time alerts to subscribed users
    - Handles user commands for querying contract risk scores and security news
    """
    
    def __init__(self, bot_token: str):
        """
        Initialize the Telegram bot handler.
        
        Args:
            bot_token: The Telegram bot token
        """
        self.bot_token = bot_token
        self.api_base_url = f"https://api.telegram.org/bot{bot_token}"
        self.subscribed_users: Set[int] = set()  # Set of chat_ids
        self.user_protocols: Dict[int, List[str]] = {}  # chat_id -> list of protocols
        self.user_addresses: Dict[int, List[str]] = {}  # chat_id -> list of addresses
        self.polling_task: Optional[asyncio.Task] = None
        
        logger.info("Telegram bot handler initialized")
    
    async def start_polling(self) -> None:
        """Start polling for updates from Telegram."""
        if self.polling_task is not None:
            logger.warning("Polling task already running")
            return
        
        self.polling_task = asyncio.create_task(self._poll_updates())
        logger.info("Started polling for Telegram updates")
    
    async def stop_polling(self) -> None:
        """Stop polling for updates from Telegram."""
        if self.polling_task is None:
            logger.warning("No polling task to stop")
            return
        
        self.polling_task.cancel()
        try:
            await self.polling_task
        except asyncio.CancelledError:
            pass
        
        self.polling_task = None
        logger.info("Stopped polling for Telegram updates")
    
    async def _poll_updates(self) -> None:
        """Poll for updates from Telegram."""
        offset = 0
        
        while True:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.api_base_url}/getUpdates",
                        params={"offset": offset, "timeout": 30}
                    ) as response:
                        if response.status != 200:
                            logger.error(
                                "Failed to get updates from Telegram",
                                status=response.status,
                                reason=response.reason
                            )
                            await asyncio.sleep(5)
                            continue
                        
                        data = await response.json()
                        
                        if not data.get("ok", False):
                            logger.error(
                                "Telegram API returned error",
                                error=data.get("description", "Unknown error")
                            )
                            await asyncio.sleep(5)
                            continue
                        
                        updates = data.get("result", [])
                        
                        for update in updates:
                            offset = max(offset, update["update_id"] + 1)
                            await self._process_update(update)
            
            except asyncio.CancelledError:
                logger.info("Polling task cancelled")
                break
            except Exception as e:
                logger.exception("Error in polling task", error=str(e))
                await asyncio.sleep(5)
    
    async def _process_update(self, update: dict) -> None:
        """
        Process an update from Telegram.
        
        Args:
            update: The update to process
        """
        if "message" not in update:
            return
        
        message = update["message"]
        
        if "text" not in message:
            return
        
        chat_id = message["chat"]["id"]
        text = message["text"]
        
        if text.startswith("/"):
            await self._handle_command(chat_id, text)
    
    async def _handle_command(self, chat_id: int, command: str) -> None:
        """
        Handle a command from a user.
        
        Args:
            chat_id: The chat ID of the user
            command: The command to handle
        """
        command = command.lower()
        
        if command == "/start":
            await self._send_message(
                chat_id,
                "Welcome to FlareSense! 🔍\n\n"
                "I'll send you real-time security alerts for blockchain activity "
                "and DeFi protocols.\n\n"
                "Commands:\n"
                "/subscribe - Subscribe to alerts\n"
                "/unsubscribe - Unsubscribe from alerts\n"
                "/monitor_protocol <protocol> - Monitor a protocol\n"
                "/monitor_address <address> - Monitor an address\n"
                "/risk <contract_address> - Get risk score for a contract\n"
                "/news - Get latest DeFi security news\n"
                "/help - Show this help message"
            )
        
        elif command == "/subscribe":
            self.subscribed_users.add(chat_id)
            await self._send_message(
                chat_id,
                "✅ You are now subscribed to FlareSense alerts!"
            )
        
        elif command == "/unsubscribe":
            self.subscribed_users.discard(chat_id)
            await self._send_message(
                chat_id,
                "❌ You are now unsubscribed from FlareSense alerts."
            )
        
        elif command.startswith("/monitor_protocol "):
            protocol = command.split(" ", 1)[1].strip()
            
            if not protocol:
                await self._send_message(
                    chat_id,
                    "⚠️ Please specify a protocol to monitor.\n"
                    "Example: /monitor_protocol Uniswap"
                )
                return
            
            if chat_id not in self.user_protocols:
                self.user_protocols[chat_id] = []
            
            if protocol not in self.user_protocols[chat_id]:
                self.user_protocols[chat_id].append(protocol)
            
            await self._send_message(
                chat_id,
                f"✅ Now monitoring protocol: {protocol}"
            )
        
        elif command.startswith("/monitor_address "):
            address = command.split(" ", 1)[1].strip()
            
            if not address:
                await self._send_message(
                    chat_id,
                    "⚠️ Please specify an address to monitor.\n"
                    "Example: /monitor_address 0x1234..."
                )
                return
            
            if chat_id not in self.user_addresses:
                self.user_addresses[chat_id] = []
            
            if address not in self.user_addresses[chat_id]:
                self.user_addresses[chat_id].append(address)
            
            await self._send_message(
                chat_id,
                f"✅ Now monitoring address: {address}"
            )
        
        elif command.startswith("/risk "):
            contract_address = command.split(" ", 1)[1].strip()
            
            if not contract_address:
                await self._send_message(
                    chat_id,
                    "⚠️ Please specify a contract address.\n"
                    "Example: /risk 0x1234..."
                )
                return
            
            # This would be expanded to actually query the risk score
            await self._send_message(
                chat_id,
                f"🔍 Risk assessment for {contract_address}:\n\n"
                "Security Score: 75/100 (Medium Risk)\n"
                "Vulnerabilities: 2 medium, 1 low\n"
                "Last Audit: 3 months ago\n\n"
                "For detailed analysis, visit the FlareSense dashboard."
            )
        
        elif command == "/news":
            # This would be expanded to actually fetch the latest news
            await self._send_message(
                chat_id,
                "📰 Latest DeFi Security News:\n\n"
                "• [HIGH] Potential vulnerability discovered in lending protocol\n"
                "• [MEDIUM] Unusual activity detected on major DEX\n"
                "• [LOW] New security best practices published for smart contracts\n\n"
                "For more details, visit the FlareSense dashboard."
            )
        
        elif command == "/help":
            await self._send_message(
                chat_id,
                "FlareSense Bot Commands:\n\n"
                "/subscribe - Subscribe to alerts\n"
                "/unsubscribe - Unsubscribe from alerts\n"
                "/monitor_protocol <protocol> - Monitor a protocol\n"
                "/monitor_address <address> - Monitor an address\n"
                "/risk <contract_address> - Get risk score for a contract\n"
                "/news - Get latest DeFi security news\n"
                "/help - Show this help message"
            )
        
        else:
            await self._send_message(
                chat_id,
                "⚠️ Unknown command. Type /help to see available commands."
            )
    
    async def _send_message(self, chat_id: int, text: str) -> None:
        """
        Send a message to a user.
        
        Args:
            chat_id: The chat ID to send the message to
            text: The text to send
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/sendMessage",
                    json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
                ) as response:
                    if response.status != 200:
                        logger.error(
                            "Failed to send message to Telegram",
                            status=response.status,
                            reason=response.reason,
                            chat_id=chat_id
                        )
                        return
                    
                    data = await response.json()
                    
                    if not data.get("ok", False):
                        logger.error(
                            "Telegram API returned error",
                            error=data.get("description", "Unknown error"),
                            chat_id=chat_id
                        )
        except Exception as e:
            logger.exception("Error sending message to Telegram", error=str(e), chat_id=chat_id)
    
    async def handle_alert(self, alert: Alert) -> None:
        """
        Handle an alert by sending it to subscribed users.
        
        Args:
            alert: The alert to handle
        """
        if not self.subscribed_users:
            logger.info("No users subscribed to alerts")
            return
        
        # Format the alert message
        message = self._format_alert_message(alert)
        
        # Send to all subscribed users
        for chat_id in self.subscribed_users:
            # Check if this alert is relevant to the user's monitored protocols/addresses
            if self._is_alert_relevant_to_user(chat_id, alert):
                await self._send_message(chat_id, message)
    
    def _format_alert_message(self, alert: Alert) -> str:
        """
        Format an alert as a message for Telegram.
        
        Args:
            alert: The alert to format
            
        Returns:
            str: The formatted message
        """
        severity_emoji = {
            "high": "🔴",
            "medium": "🟠",
            "low": "🟢"
        }.get(alert.severity, "⚪")
        
        type_emoji = {
            "whale_transaction": "🐋",
            "unusual_activity": "👁️",
            "vulnerable_contract": "🔓",
            "security_news": "📰",
            "protocol_compromise": "🚨"
        }.get(alert.type, "ℹ️")
        
        message = (
            f"{severity_emoji} {type_emoji} *{alert.title}*\n\n"
            f"{alert.description}\n\n"
            f"*Source:* {alert.source}\n"
            f"*Time:* {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        )
        
        if alert.affected_protocols:
            message += f"*Affected Protocols:* {', '.join(alert.affected_protocols)}\n"
        
        if alert.affected_addresses:
            # Truncate addresses for readability
            formatted_addresses = [
                f"{addr[:6]}...{addr[-4:]}" for addr in alert.affected_addresses
            ]
            message += f"*Affected Addresses:* {', '.join(formatted_addresses)}\n"
        
        return message
    
    def _is_alert_relevant_to_user(self, chat_id: int, alert: Alert) -> bool:
        """
        Check if an alert is relevant to a user.
        
        Args:
            chat_id: The chat ID of the user
            alert: The alert to check
            
        Returns:
            bool: True if the alert is relevant to the user, False otherwise
        """
        # If the user hasn't set up any filters, all alerts are relevant
        if chat_id not in self.user_protocols and chat_id not in self.user_addresses:
            return True
        
        # Check if any protocols match
        user_protocols = self.user_protocols.get(chat_id, [])
        if any(protocol in alert.affected_protocols for protocol in user_protocols):
            return True
        
        # Check if any addresses match
        user_addresses = self.user_addresses.get(chat_id, [])
        if any(address in alert.affected_addresses for address in user_addresses):
            return True
        
        # If the user has set up filters but none match, the alert is not relevant
        return False 