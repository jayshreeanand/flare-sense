"""
AI Module

This module provides AI capabilities for the Flare AI Agent.
It includes providers for different AI services and utilities for
contract analysis and risk assessment.
"""

from .base import (
    BaseAIProvider,
    ChatRequest,
    CompletionRequest,
    GenerationConfig,
    ModelResponse,
)
from .gemini import GeminiProvider
from .openrouter import AsyncOpenRouterProvider, OpenRouterProvider
from .contract_analyzer import ContractAnalyzer
from .risk_assessment import (
    RiskAssessmentEngine,
    RiskLevel,
    RiskCategory,
    RiskFinding,
    RiskAssessmentResult,
    risk_engine
)

__all__ = [
    "AsyncOpenRouterProvider",
    "BaseAIProvider",
    "ChatRequest",
    "CompletionRequest",
    "GeminiProvider",
    "GenerationConfig",
    "ModelResponse",
    "OpenRouterProvider",
    "ContractAnalyzer",
    "RiskAssessmentEngine",
    "RiskLevel",
    "RiskCategory",
    "RiskFinding",
    "RiskAssessmentResult",
    "risk_engine"
]
