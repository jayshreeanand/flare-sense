"""
Risk Assessment API Routes

This module provides FastAPI routes for AI-powered risk assessment,
including endpoints to:
- Assess risks for smart contracts
- Assess risks for protocols
- Assess risks for blockchain addresses
- Search the security knowledge base
"""

from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from flare_ai_defai.ai.risk_assessment import (
    risk_engine,
    RiskLevel,
    RiskCategory,
    RiskFinding,
    RiskAssessmentResult
)

router = APIRouter()

# Models for API requests and responses

class RiskAssessmentRequest(BaseModel):
    """Model for risk assessment requests."""
    
    target_type: str = Field(..., description="Type of target (contract, protocol, or address)")
    target_id: str = Field(..., description="Identifier for the target (address, protocol name, etc.)")
    additional_context: Optional[str] = Field(None, description="Additional context information")


class RiskFindingResponse(BaseModel):
    """Model for risk finding responses."""
    
    category: str
    level: str
    title: str
    description: str
    recommendation: str
    confidence: float
    sources: List[str]


class RiskAssessmentResponse(BaseModel):
    """Model for risk assessment responses."""
    
    target_type: str
    target_id: str
    overall_risk_level: str
    findings: List[RiskFindingResponse]
    summary: str
    timestamp: str
    metadata: Dict[str, Any]


class KnowledgeBaseSearchRequest(BaseModel):
    """Model for knowledge base search requests."""
    
    query: str = Field(..., description="Search query")


class KnowledgeBaseSearchResponse(BaseModel):
    """Model for knowledge base search responses."""
    
    results: List[Dict[str, Any]]
    count: int


@router.post("/assess", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Perform a comprehensive risk assessment using multiple AI models.
    
    This endpoint uses RAG (Retrieval-Augmented Generation) and consensus learning
    to provide a thorough risk assessment with reduced false positives.
    """
    if request.target_type not in ["contract", "protocol", "address"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid target type: {request.target_type}. Must be one of: contract, protocol, address"
        )
    
    try:
        result = await risk_engine.assess_risk(
            target_type=request.target_type,
            target_id=request.target_id,
            additional_context=request.additional_context
        )
        
        # Convert dataclass to Pydantic model
        return RiskAssessmentResponse(
            target_type=result.target_type,
            target_id=result.target_id,
            overall_risk_level=result.overall_risk_level,
            findings=[
                RiskFindingResponse(
                    category=finding.category,
                    level=finding.level,
                    title=finding.title,
                    description=finding.description,
                    recommendation=finding.recommendation,
                    confidence=finding.confidence,
                    sources=finding.sources
                )
                for finding in result.findings
            ],
            summary=result.summary,
            timestamp=result.timestamp,
            metadata=result.metadata
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error performing risk assessment: {str(e)}"
        )


@router.post("/search", response_model=KnowledgeBaseSearchResponse)
async def search_knowledge_base(request: KnowledgeBaseSearchRequest):
    """
    Search the security knowledge base for relevant information.
    
    This endpoint allows searching for past security reports, exploit history,
    and audit data related to the provided query.
    """
    try:
        results = await risk_engine.knowledge_base.search_knowledge_base(request.query)
        return KnowledgeBaseSearchResponse(
            results=results,
            count=len(results)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching knowledge base: {str(e)}"
        )


@router.get("/categories", response_model=List[Dict[str, str]])
async def get_risk_categories():
    """Get all available risk categories."""
    return [
        {"id": category.value, "name": category.name.replace("_", " ").title()}
        for category in RiskCategory
    ]


@router.get("/levels", response_model=List[Dict[str, str]])
async def get_risk_levels():
    """Get all available risk levels."""
    return [
        {"id": level.value, "name": level.name.title()}
        for level in RiskLevel
    ] 