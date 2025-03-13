"""
Smart Contract Analysis API Routes

This module provides FastAPI routes for smart contract security analysis,
including vulnerability detection, monitoring, and risk assessment.
"""

from collections.abc import Callable
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from web3 import Web3

from flare_ai_defai.ai.contract_analyzer import ContractAnalyzer, SecurityAnalysis
from flare_ai_defai.ai.gemini import GeminiProvider
from flare_ai_defai.settings import settings


class ContractAnalysisRequest(BaseModel):
    """Request model for contract analysis."""

    contract_code: str = Field(..., description="Source code of the smart contract")
    contract_name: str = Field(..., description="Name of the smart contract")


class ContractMonitoringRequest(BaseModel):
    """Request model for contract monitoring."""

    contract_address: str = Field(..., description="Address of the contract to monitor")
    num_blocks: int = Field(1000, description="Number of recent blocks to analyze")


router = APIRouter()


def get_analyzer() -> ContractAnalyzer:
    """Dependency to create ContractAnalyzer instance."""
    web3 = Web3(Web3.HTTPProvider(settings.web3_provider_url))
    ai_provider = GeminiProvider(
        api_key=settings.gemini_api_key,
        model=settings.gemini_model,
    )
    return ContractAnalyzer(
        ai_provider=ai_provider,
        web3_provider=web3,
        chain_id=settings.chain_id,
    )


@router.post("/analyze", response_model=SecurityAnalysis)  # type: ignore[misc]
async def analyze_contract(
    request: ContractAnalysisRequest,
    analyzer: Annotated[ContractAnalyzer, Depends(get_analyzer)],
) -> SecurityAnalysis:
    """
    Analyze a smart contract for security vulnerabilities.

    Args:
        request: Contract analysis request containing source code
        analyzer: Contract analyzer instance

    Returns:
        SecurityAnalysis containing risk assessment and recommendations

    Raises:
        HTTPException: If analysis fails
    """
    try:
        return await analyzer.analyze_contract(request.contract_code)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Contract analysis failed: {str(e)}",
        ) from e


@router.post("/monitor")  # type: ignore[misc]
async def monitor_contract(
    request: ContractMonitoringRequest,
    analyzer: Annotated[ContractAnalyzer, Depends(get_analyzer)],
) -> list[dict]:
    """
    Monitor a deployed contract for suspicious activities.

    Args:
        request: Contract monitoring request
        analyzer: Contract analyzer instance

    Returns:
        List of suspicious activities detected

    Raises:
        HTTPException: If monitoring fails
    """
    try:
        return await analyzer.monitor_contract(
            request.contract_address,
            request.num_blocks,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Contract monitoring failed: {str(e)}",
        ) from e 