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