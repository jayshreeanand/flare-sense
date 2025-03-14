"""
Monitoring API Routes

This module provides FastAPI routes for blockchain monitoring and security alerts,
including endpoints to:
- Get recent blockchain activity (whale transactions, unusual withdrawals)
- Get security news and alerts
- Register user addresses and protocols for monitoring
- Get user-specific alerts
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from flare_ai_defai.monitoring import AlertService, AlertType, Alert
from flare_ai_defai.monitoring import BlockchainMonitor, NewsMonitor
from flare_ai_defai.settings import settings

router = APIRouter()

# Models for API requests and responses

class AddressRegistration(BaseModel):
    """Model for registering an address for monitoring."""
    
    user_id: str = Field(..., description="User ID")
    address: str = Field(..., description="Blockchain address to monitor")


class ProtocolRegistration(BaseModel):
    """Model for registering a protocol for monitoring."""
    
    user_id: str = Field(..., description="User ID")
    protocol: str = Field(..., description="Protocol name to monitor")


class AlertResponse(BaseModel):
    """Model for alert responses."""
    
    id: str
    type: str
    title: str
    description: str
    source: str
    severity: str
    timestamp: str
    affected_protocols: List[str] = []
    affected_addresses: List[str] = []


class RegisterAddressRequest(BaseModel):
    """Request model for registering an address for monitoring."""
    
    user_id: str = Field(..., description="User ID for tracking")
    address: str = Field(..., description="Blockchain address to monitor")


class RegisterProtocolRequest(BaseModel):
    """Request model for registering a protocol for monitoring."""
    
    user_id: str = Field(..., description="User ID for tracking")
    protocol: str = Field(..., description="Protocol name to monitor")


class TelegramSubscriptionRequest(BaseModel):
    """Request model for managing Telegram bot subscriptions."""
    
    chat_id: int = Field(..., description="Telegram chat ID")


# Dependency to get service instances

def get_alert_service() -> AlertService:
    """Get the alert service instance."""
    # In a real implementation, this would be a singleton or from a dependency injection system
    return AlertService()


def get_blockchain_monitor() -> BlockchainMonitor:
    """Get the blockchain monitor instance."""
    # In a real implementation, this would be a singleton or from a dependency injection system
    return BlockchainMonitor()


def get_news_monitor() -> NewsMonitor:
    """Get the news monitor instance."""
    # In a real implementation, this would be a singleton or from a dependency injection system
    return NewsMonitor()


# API routes

@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    user_id: Optional[str] = None,
    alert_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    alert_service: AlertService = Depends(get_alert_service),
):
    """
    Get alerts, optionally filtered by user ID, type, and severity.
    
    Args:
        user_id: Optional user ID to get alerts for
        alert_type: Optional alert type to filter by
        severity: Optional severity level to filter by
        limit: Maximum number of alerts to return
        alert_service: Alert service instance
        
    Returns:
        List of alerts matching the criteria
    """
    if user_id:
        # Get user-specific alerts
        alerts = alert_service.get_alerts_for_user(user_id)
    else:
        # Get all alerts
        alerts = alert_service.alert_history
    
    # Apply filters
    if alert_type:
        try:
            alert_type_enum = AlertType(alert_type)
            alerts = [a for a in alerts if a.type == alert_type_enum]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid alert type: {alert_type}")
    
    if severity:
        alerts = [a for a in alerts if a.severity.value == severity.lower()]
    
    # Sort by timestamp (newest first) and limit
    alerts = sorted(alerts, key=lambda a: a.timestamp, reverse=True)[:limit]
    
    # Convert to response model
    return [
        AlertResponse(
            id=a.id,
            type=a.type.value,
            title=a.title,
            description=a.description,
            source=a.source,
            severity=a.severity.value,
            timestamp=a.timestamp.isoformat(),
            affected_protocols=a.affected_protocols,
            affected_addresses=a.affected_addresses,
        )
        for a in alerts
    ]


@router.post("/register/address")
async def register_address(
    registration: AddressRegistration,
    alert_service: AlertService = Depends(get_alert_service),
):
    """
    Register an address for monitoring.
    
    Args:
        registration: Address registration details
        alert_service: Alert service instance
        
    Returns:
        Confirmation message
    """
    alert_service.register_user_address(registration.user_id, registration.address)
    return {"status": "success", "message": "Address registered for monitoring"}


@router.post("/register/protocol")
async def register_protocol(
    registration: ProtocolRegistration,
    alert_service: AlertService = Depends(get_alert_service),
):
    """
    Register a protocol for monitoring.
    
    Args:
        registration: Protocol registration details
        alert_service: Alert service instance
        
    Returns:
        Confirmation message
    """
    alert_service.register_user_protocol(registration.user_id, registration.protocol)
    return {"status": "success", "message": "Protocol registered for monitoring"}


@router.get("/blockchain/activity")
async def get_blockchain_activity(
    blockchain_monitor: BlockchainMonitor = Depends(get_blockchain_monitor),
):
    """
    Get recent blockchain activity.
    
    Args:
        blockchain_monitor: Blockchain monitor instance
        
    Returns:
        Recent blockchain activity
    """
    # In a real implementation, this would return actual blockchain activity
    return {
        "status": "success",
        "message": "Blockchain monitoring active",
        "last_processed_block": blockchain_monitor.last_processed_block,
    }


@router.get("/news")
async def get_security_news(
    news_monitor: NewsMonitor = Depends(get_news_monitor),
):
    """
    Get recent security news.
    
    Args:
        news_monitor: News monitor instance
        
    Returns:
        Recent security news
    """
    # In a real implementation, this would return actual security news
    return {
        "status": "success",
        "message": "News monitoring active",
        "known_alerts_count": len(news_monitor.known_alerts),
    }


@router.post("/telegram/subscribe")
async def telegram_subscribe(request: TelegramSubscriptionRequest) -> dict:
    """
    Subscribe to Telegram alerts.
    
    Args:
        request: The subscription request
        
    Returns:
        Confirmation message
    """
    try:
        from flare_ai_defai.main import telegram_bot_handler
        
        if telegram_bot_handler is None:
            raise HTTPException(
                status_code=400, 
                detail="Telegram bot is not enabled. Set ENABLE_TELEGRAM_BOT=true and provide TELEGRAM_BOT_TOKEN in .env"
            )
        
        telegram_bot_handler.subscribed_users.add(request.chat_id)
        return {"status": "success", "message": "Subscribed to Telegram alerts"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error subscribing to Telegram", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to subscribe to Telegram: {str(e)}")


@router.post("/telegram/unsubscribe")
async def telegram_unsubscribe(request: TelegramSubscriptionRequest) -> dict:
    """
    Unsubscribe from Telegram alerts.
    
    Args:
        request: The subscription request
        
    Returns:
        Confirmation message
    """
    try:
        from flare_ai_defai.main import telegram_bot_handler
        
        if telegram_bot_handler is None:
            raise HTTPException(
                status_code=400, 
                detail="Telegram bot is not enabled. Set ENABLE_TELEGRAM_BOT=true and provide TELEGRAM_BOT_TOKEN in .env"
            )
        
        telegram_bot_handler.subscribed_users.discard(request.chat_id)
        return {"status": "success", "message": "Unsubscribed from Telegram alerts"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error unsubscribing from Telegram", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to unsubscribe from Telegram: {str(e)}")


@router.post("/telegram/monitor/protocol")
async def telegram_monitor_protocol(request: TelegramSubscriptionRequest, protocol: str) -> dict:
    """
    Register a protocol for monitoring via Telegram.
    
    Args:
        request: The subscription request
        protocol: The protocol to monitor
        
    Returns:
        Confirmation message
    """
    try:
        from flare_ai_defai.main import telegram_bot_handler
        
        if telegram_bot_handler is None:
            raise HTTPException(
                status_code=400, 
                detail="Telegram bot is not enabled. Set ENABLE_TELEGRAM_BOT=true and provide TELEGRAM_BOT_TOKEN in .env"
            )
        
        if request.chat_id not in telegram_bot_handler.user_protocols:
            telegram_bot_handler.user_protocols[request.chat_id] = []
        
        if protocol not in telegram_bot_handler.user_protocols[request.chat_id]:
            telegram_bot_handler.user_protocols[request.chat_id].append(protocol)
        
        return {"status": "success", "message": f"Now monitoring protocol: {protocol}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error monitoring protocol via Telegram", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to monitor protocol: {str(e)}")


@router.post("/telegram/monitor/address")
async def telegram_monitor_address(request: TelegramSubscriptionRequest, address: str) -> dict:
    """
    Register an address for monitoring via Telegram.
    
    Args:
        request: The subscription request
        address: The address to monitor
        
    Returns:
        Confirmation message
    """
    try:
        from flare_ai_defai.main import telegram_bot_handler
        
        if telegram_bot_handler is None:
            raise HTTPException(
                status_code=400, 
                detail="Telegram bot is not enabled. Set ENABLE_TELEGRAM_BOT=true and provide TELEGRAM_BOT_TOKEN in .env"
            )
        
        if request.chat_id not in telegram_bot_handler.user_addresses:
            telegram_bot_handler.user_addresses[request.chat_id] = []
        
        if address not in telegram_bot_handler.user_addresses[request.chat_id]:
            telegram_bot_handler.user_addresses[request.chat_id].append(address)
        
        return {"status": "success", "message": f"Now monitoring address: {address}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error monitoring address via Telegram", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to monitor address: {str(e)}") 