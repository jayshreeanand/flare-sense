"""
API Module

This module provides API routes for the Flare AI Agent.
"""

from fastapi import APIRouter
from flare_ai_defai.api.routes.chat import ChatRouter
from flare_ai_defai.api.contract_routes import router as contract_router
from flare_ai_defai.api.monitoring_routes import router as monitoring_router
from flare_ai_defai.api.risk_assessment_routes import router as risk_assessment_router

# Create a combined router
router = APIRouter()
router.include_router(contract_router)
router.include_router(monitoring_router)
router.include_router(risk_assessment_router)

__all__ = [
    "ChatRouter",
    "contract_router",
    "monitoring_router",
    "risk_assessment_router",
    "router"
]
