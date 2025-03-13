"""
API Module

This module provides API routes for the Flare AI Agent.
"""

from flare_ai_defai.api.contract_routes import router as contract_router
from flare_ai_defai.api.monitoring_routes import router as monitoring_router
from flare_ai_defai.api.risk_assessment_routes import router as risk_assessment_router

__all__ = [
    "contract_router",
    "monitoring_router",
    "risk_assessment_router"
]
