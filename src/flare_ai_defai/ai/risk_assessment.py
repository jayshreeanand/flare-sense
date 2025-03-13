"""
Risk Assessment Module

This module provides AI-powered risk assessment capabilities using RAG (Retrieval-Augmented Generation)
and consensus learning from multiple AI models to reduce false positives.

It fetches past security reports, exploit history, and audit data to provide comprehensive
risk assessments for smart contracts, protocols, and blockchain addresses.
"""

import asyncio
import json
import structlog
from dataclasses import dataclass
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum

from flare_ai_defai.ai.base import BaseAIProvider, ModelResponse
from flare_ai_defai.ai.gemini import GeminiProvider
from flare_ai_defai.ai.openrouter import OpenRouterProvider
from flare_ai_defai.settings import settings

logger = structlog.get_logger(__name__)

class RiskLevel(str, Enum):
    """Risk level enumeration for assessment results."""
    
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskCategory(str, Enum):
    """Categories of risks that can be identified."""
    
    SMART_CONTRACT_VULNERABILITY = "smart_contract_vulnerability"
    PROTOCOL_DESIGN_FLAW = "protocol_design_flaw"
    CENTRALIZATION_RISK = "centralization_risk"
    ECONOMIC_ATTACK_VECTOR = "economic_attack_vector"
    ORACLE_MANIPULATION = "oracle_manipulation"
    GOVERNANCE_RISK = "governance_risk"
    LIQUIDITY_RISK = "liquidity_risk"
    FLASH_LOAN_ATTACK_VECTOR = "flash_loan_attack_vector"
    REENTRANCY_VULNERABILITY = "reentrancy_vulnerability"
    ACCESS_CONTROL_ISSUE = "access_control_issue"


@dataclass
class RiskFinding:
    """A specific risk finding from the assessment."""
    
    category: RiskCategory
    level: RiskLevel
    title: str
    description: str
    recommendation: str
    confidence: float  # 0.0 to 1.0
    sources: List[str]  # References to sources that identified this risk


@dataclass
class RiskAssessmentResult:
    """Complete risk assessment result."""
    
    target_type: str  # "contract", "protocol", or "address"
    target_id: str  # Contract address, protocol name, or wallet address
    overall_risk_level: RiskLevel
    findings: List[RiskFinding]
    summary: str
    timestamp: str
    metadata: Dict[str, Any]


class SecurityKnowledgeBase:
    """
    Knowledge base for security-related information.
    
    This class manages the retrieval of security reports, exploit history,
    and audit data to provide context for risk assessments.
    """
    
    def __init__(self):
        """Initialize the security knowledge base."""
        self.exploit_history: Dict[str, List[Dict[str, Any]]] = {}
        self.audit_reports: Dict[str, List[Dict[str, Any]]] = {}
        self.security_advisories: List[Dict[str, Any]] = []
        
        # Initialize with some sample data for demonstration
        self._load_sample_data()
    
    def _load_sample_data(self):
        """Load sample security data for demonstration purposes."""
        # Sample exploit history
        self.exploit_history = {
            "uniswap": [
                {
                    "date": "2023-04-15",
                    "title": "Price manipulation attack",
                    "description": "Attackers manipulated price oracles to drain liquidity pools.",
                    "loss_amount": "$3.2M",
                    "attack_vector": "Oracle manipulation"
                }
            ],
            "aave": [
                {
                    "date": "2022-11-22",
                    "title": "Flash loan exploit",
                    "description": "Attacker used flash loans to manipulate collateral prices.",
                    "loss_amount": "$1.5M",
                    "attack_vector": "Flash loan + oracle manipulation"
                }
            ]
        }
        
        # Sample audit reports
        self.audit_reports = {
            "0x742d35Cc6634C0532925a3b844Bc454e4438f44e": [
                {
                    "auditor": "CertiK",
                    "date": "2023-01-10",
                    "findings": [
                        {
                            "severity": "high",
                            "title": "Reentrancy vulnerability",
                            "description": "Potential reentrancy in withdraw function"
                        },
                        {
                            "severity": "medium",
                            "title": "Centralization risk",
                            "description": "Admin has excessive privileges"
                        }
                    ]
                }
            ]
        }
        
        # Sample security advisories
        self.security_advisories = [
            {
                "date": "2023-09-05",
                "title": "Increasing flash loan attacks in DeFi",
                "description": "Recent trend shows increasing use of flash loans in exploits",
                "affected_categories": ["lending", "dex"]
            },
            {
                "date": "2023-10-12",
                "title": "Vulnerable solidity patterns",
                "description": "Common vulnerable patterns in Solidity smart contracts",
                "affected_categories": ["smart_contracts", "defi"]
            }
        ]
    
    async def get_exploit_history(self, protocol_name: str) -> List[Dict[str, Any]]:
        """
        Retrieve exploit history for a specific protocol.
        
        Args:
            protocol_name: Name of the protocol
            
        Returns:
            List of exploit incidents
        """
        # In a real implementation, this would query a database or external API
        return self.exploit_history.get(protocol_name.lower(), [])
    
    async def get_audit_reports(self, contract_address: str) -> List[Dict[str, Any]]:
        """
        Retrieve audit reports for a specific contract.
        
        Args:
            contract_address: Address of the smart contract
            
        Returns:
            List of audit reports
        """
        # In a real implementation, this would query a database or external API
        return self.audit_reports.get(contract_address, [])
    
    async def get_relevant_advisories(self, categories: List[str]) -> List[Dict[str, Any]]:
        """
        Retrieve security advisories relevant to specific categories.
        
        Args:
            categories: List of categories to filter advisories
            
        Returns:
            List of relevant security advisories
        """
        # In a real implementation, this would query a database or external API
        return [
            advisory for advisory in self.security_advisories
            if any(category in advisory.get("affected_categories", []) for category in categories)
        ]
    
    async def search_knowledge_base(self, query: str) -> List[Dict[str, Any]]:
        """
        Search the knowledge base for relevant information.
        
        Args:
            query: Search query
            
        Returns:
            List of relevant information items
        """
        # In a real implementation, this would use vector search or similar technology
        results = []
        
        # Simple keyword matching for demonstration
        query_lower = query.lower()
        
        # Search exploit history
        for protocol, exploits in self.exploit_history.items():
            for exploit in exploits:
                if (query_lower in protocol or 
                    query_lower in exploit.get("title", "").lower() or 
                    query_lower in exploit.get("description", "").lower()):
                    results.append({
                        "type": "exploit",
                        "protocol": protocol,
                        "data": exploit
                    })
        
        # Search audit reports
        for address, reports in self.audit_reports.items():
            for report in reports:
                for finding in report.get("findings", []):
                    if (query_lower in finding.get("title", "").lower() or 
                        query_lower in finding.get("description", "").lower()):
                        results.append({
                            "type": "audit_finding",
                            "contract": address,
                            "auditor": report.get("auditor"),
                            "data": finding
                        })
        
        # Search advisories
        for advisory in self.security_advisories:
            if (query_lower in advisory.get("title", "").lower() or 
                query_lower in advisory.get("description", "").lower()):
                results.append({
                    "type": "advisory",
                    "data": advisory
                })
        
        return results


class RiskAssessmentEngine:
    """
    AI-powered risk assessment engine using RAG and consensus learning.
    
    This class coordinates multiple AI models to perform risk assessments
    and uses consensus learning to reduce false positives.
    """
    
    def __init__(self):
        """Initialize the risk assessment engine."""
        self.knowledge_base = SecurityKnowledgeBase()
        
        # Initialize AI providers
        self.ai_providers = []
        
        # Add Gemini provider if API key is available
        if hasattr(settings, "gemini_api_key") and settings.gemini_api_key:
            self.ai_providers.append(
                GeminiProvider(
                    api_key=settings.gemini_api_key,
                    model=settings.gemini_model
                )
            )
        
        # Add OpenRouter provider if API key is available
        if hasattr(settings, "openrouter_api_key") and settings.openrouter_api_key:
            self.ai_providers.append(
                OpenRouterProvider(
                    api_key=settings.openrouter_api_key,
                    model="anthropic/claude-3-opus"
                )
            )
            
            # Add a second model for better consensus
            self.ai_providers.append(
                OpenRouterProvider(
                    api_key=settings.openrouter_api_key,
                    model="openai/gpt-4"
                )
            )
        
        # Fallback to Gemini if no providers are available
        if not self.ai_providers and hasattr(settings, "gemini_api_key") and settings.gemini_api_key:
            self.ai_providers.append(
                GeminiProvider(
                    api_key=settings.gemini_api_key,
                    model=settings.gemini_model
                )
            )
        
        if not self.ai_providers:
            logger.warning("No AI providers available for risk assessment")
    
    async def _query_model(
        self, 
        provider: BaseAIProvider, 
        prompt: str, 
        context: str
    ) -> Tuple[ModelResponse, Any]:
        """
        Query an AI model with the given prompt and context.
        
        Args:
            provider: AI provider to use
            prompt: The prompt to send to the model
            context: Context information from the knowledge base
            
        Returns:
            Tuple of model response and parsed JSON result
        """
        full_prompt = f"""
        You are a blockchain security expert performing a risk assessment.
        
        CONTEXT INFORMATION:
        {context}
        
        TASK:
        {prompt}
        
        Provide your assessment in the following JSON format:
        {{
            "overall_risk_level": "low|medium|high|critical",
            "findings": [
                {{
                    "category": "<risk_category>",
                    "level": "low|medium|high|critical",
                    "title": "<concise_title>",
                    "description": "<detailed_description>",
                    "recommendation": "<mitigation_recommendation>",
                    "confidence": <float_between_0_and_1>
                }}
            ],
            "summary": "<overall_assessment_summary>"
        }}
        
        Ensure your response is valid JSON.
        """
        
        provider.reset()  # Reset conversation history
        response = provider.generate(full_prompt)
        
        # Extract JSON from response
        try:
            # Try to parse the entire response as JSON
            result = json.loads(response.text)
        except json.JSONDecodeError:
            # If that fails, try to extract JSON from the text
            try:
                # Look for JSON between triple backticks
                json_text = response.text.split("```json")[1].split("```")[0].strip()
                result = json.loads(json_text)
            except (IndexError, json.JSONDecodeError):
                try:
                    # Look for JSON between regular backticks
                    json_text = response.text.split("```")[1].split("```")[0].strip()
                    result = json.loads(json_text)
                except (IndexError, json.JSONDecodeError):
                    logger.error("Failed to parse JSON from model response", response=response.text)
                    result = {
                        "overall_risk_level": "medium",
                        "findings": [],
                        "summary": "Failed to parse model response"
                    }
        
        return response, result
    
    async def _get_context_for_assessment(
        self, 
        target_type: str, 
        target_id: str
    ) -> str:
        """
        Gather context information for the assessment.
        
        Args:
            target_type: Type of target ("contract", "protocol", or "address")
            target_id: Identifier for the target
            
        Returns:
            Context information as a string
        """
        context_parts = []
        
        if target_type == "protocol":
            # Get exploit history for the protocol
            exploits = await self.knowledge_base.get_exploit_history(target_id)
            if exploits:
                context_parts.append("EXPLOIT HISTORY:")
                for exploit in exploits:
                    context_parts.append(f"- Date: {exploit.get('date')}")
                    context_parts.append(f"  Title: {exploit.get('title')}")
                    context_parts.append(f"  Description: {exploit.get('description')}")
                    context_parts.append(f"  Loss: {exploit.get('loss_amount')}")
                    context_parts.append(f"  Attack Vector: {exploit.get('attack_vector')}")
                context_parts.append("")
            
            # Get relevant advisories
            advisories = await self.knowledge_base.get_relevant_advisories(["defi", "protocol"])
            if advisories:
                context_parts.append("SECURITY ADVISORIES:")
                for advisory in advisories:
                    context_parts.append(f"- Date: {advisory.get('date')}")
                    context_parts.append(f"  Title: {advisory.get('title')}")
                    context_parts.append(f"  Description: {advisory.get('description')}")
                context_parts.append("")
        
        elif target_type == "contract":
            # Get audit reports for the contract
            reports = await self.knowledge_base.get_audit_reports(target_id)
            if reports:
                context_parts.append("AUDIT REPORTS:")
                for report in reports:
                    context_parts.append(f"- Auditor: {report.get('auditor')}")
                    context_parts.append(f"  Date: {report.get('date')}")
                    context_parts.append("  Findings:")
                    for finding in report.get("findings", []):
                        context_parts.append(f"  - Severity: {finding.get('severity')}")
                        context_parts.append(f"    Title: {finding.get('title')}")
                        context_parts.append(f"    Description: {finding.get('description')}")
                context_parts.append("")
            
            # Get relevant advisories
            advisories = await self.knowledge_base.get_relevant_advisories(["smart_contracts"])
            if advisories:
                context_parts.append("SECURITY ADVISORIES:")
                for advisory in advisories:
                    context_parts.append(f"- Date: {advisory.get('date')}")
                    context_parts.append(f"  Title: {advisory.get('title')}")
                    context_parts.append(f"  Description: {advisory.get('description')}")
                context_parts.append("")
        
        elif target_type == "address":
            # For addresses, we might look at transaction patterns or associated contracts
            # This would be more complex in a real implementation
            context_parts.append("ADDRESS INFORMATION:")
            context_parts.append(f"- Address: {target_id}")
            context_parts.append("- No specific history available for this address")
            context_parts.append("")
        
        # Add general security knowledge
        context_parts.append("GENERAL SECURITY KNOWLEDGE:")
        context_parts.append("- Smart contracts should follow the checks-effects-interactions pattern")
        context_parts.append("- Reentrancy vulnerabilities are common in DeFi protocols")
        context_parts.append("- Oracle manipulation is a frequent attack vector")
        context_parts.append("- Flash loan attacks can exploit price manipulation vulnerabilities")
        context_parts.append("- Access control issues can lead to unauthorized fund withdrawals")
        
        return "\n".join(context_parts)
    
    async def _aggregate_findings(
        self, 
        results: List[Dict[str, Any]]
    ) -> Tuple[RiskLevel, List[RiskFinding], str]:
        """
        Aggregate findings from multiple models using consensus learning.
        
        Args:
            results: List of assessment results from different models
            
        Returns:
            Tuple of overall risk level, aggregated findings, and summary
        """
        if not results:
            return RiskLevel.LOW, [], "No assessment results available"
        
        # Count risk levels to determine consensus
        risk_level_counts = {
            RiskLevel.LOW: 0,
            RiskLevel.MEDIUM: 0,
            RiskLevel.HIGH: 0,
            RiskLevel.CRITICAL: 0
        }
        
        for result in results:
            level = result.get("overall_risk_level", "medium").lower()
            if level in risk_level_counts:
                risk_level_counts[level] += 1
            else:
                # Default to medium if invalid level
                risk_level_counts[RiskLevel.MEDIUM] += 1
        
        # Determine overall risk level (highest with at least 2 votes, or highest overall if no consensus)
        overall_risk_level = RiskLevel.LOW
        for level in [RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW]:
            if risk_level_counts[level] >= 2 or (risk_level_counts[level] > 0 and sum(risk_level_counts.values()) < 3):
                overall_risk_level = level
                break
        
        # Aggregate findings
        all_findings = []
        for result in results:
            for finding in result.get("findings", []):
                try:
                    category_str = finding.get("category", "").lower()
                    # Try to map to a valid RiskCategory or use default
                    try:
                        category = RiskCategory(category_str)
                    except ValueError:
                        # Default to smart contract vulnerability if category is invalid
                        category = RiskCategory.SMART_CONTRACT_VULNERABILITY
                    
                    level_str = finding.get("level", "").lower()
                    # Try to map to a valid RiskLevel or use default
                    try:
                        level = RiskLevel(level_str)
                    except ValueError:
                        # Default to medium if level is invalid
                        level = RiskLevel.MEDIUM
                    
                    all_findings.append(
                        RiskFinding(
                            category=category,
                            level=level,
                            title=finding.get("title", "Unknown Risk"),
                            description=finding.get("description", "No description provided"),
                            recommendation=finding.get("recommendation", "No recommendation provided"),
                            confidence=float(finding.get("confidence", 0.5)),
                            sources=["AI Model"]  # In a real implementation, we would track which model found this
                        )
                    )
                except Exception as e:
                    logger.error("Error processing finding", error=str(e), finding=finding)
        
        # Deduplicate findings by comparing titles and descriptions
        unique_findings = []
        for finding in all_findings:
            is_duplicate = False
            for unique in unique_findings:
                # Check if titles are similar
                if (finding.title.lower() == unique.title.lower() or
                    finding.description.lower() == unique.description.lower()):
                    # Update confidence if this is a duplicate with higher confidence
                    if finding.confidence > unique.confidence:
                        unique.confidence = finding.confidence
                    # Add source if not already present
                    for source in finding.sources:
                        if source not in unique.sources:
                            unique.sources.append(source)
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_findings.append(finding)
        
        # Sort findings by risk level (critical to low) and then by confidence (high to low)
        risk_level_order = {
            RiskLevel.CRITICAL: 0,
            RiskLevel.HIGH: 1,
            RiskLevel.MEDIUM: 2,
            RiskLevel.LOW: 3
        }
        
        sorted_findings = sorted(
            unique_findings,
            key=lambda f: (risk_level_order.get(f.level, 4), -f.confidence)
        )
        
        # Generate summary
        if results and "summary" in results[0]:
            summary = results[0].get("summary", "")
        else:
            # Create a basic summary if none is available
            finding_count = len(sorted_findings)
            if finding_count == 0:
                summary = "No significant security risks were identified."
            else:
                critical_count = sum(1 for f in sorted_findings if f.level == RiskLevel.CRITICAL)
                high_count = sum(1 for f in sorted_findings if f.level == RiskLevel.HIGH)
                medium_count = sum(1 for f in sorted_findings if f.level == RiskLevel.MEDIUM)
                low_count = sum(1 for f in sorted_findings if f.level == RiskLevel.LOW)
                
                summary = f"Assessment identified {finding_count} potential risks: "
                summary += f"{critical_count} critical, {high_count} high, {medium_count} medium, and {low_count} low severity issues."
        
        return overall_risk_level, sorted_findings, summary
    
    async def assess_risk(
        self, 
        target_type: str, 
        target_id: str, 
        additional_context: Optional[str] = None
    ) -> RiskAssessmentResult:
        """
        Perform a comprehensive risk assessment using multiple AI models.
        
        Args:
            target_type: Type of target ("contract", "protocol", or "address")
            target_id: Identifier for the target
            additional_context: Additional context information
            
        Returns:
            Risk assessment result
        """
        if not self.ai_providers:
            logger.error("No AI providers available for risk assessment")
            return RiskAssessmentResult(
                target_type=target_type,
                target_id=target_id,
                overall_risk_level=RiskLevel.MEDIUM,
                findings=[],
                summary="Risk assessment failed: No AI providers available",
                timestamp=str(asyncio.get_event_loop().time()),
                metadata={}
            )
        
        # Get context information
        context = await self._get_context_for_assessment(target_type, target_id)
        if additional_context:
            context += f"\n\nADDITIONAL CONTEXT:\n{additional_context}"
        
        # Prepare prompt based on target type
        if target_type == "contract":
            prompt = f"Perform a security risk assessment for smart contract at address {target_id}."
        elif target_type == "protocol":
            prompt = f"Perform a security risk assessment for the {target_id} protocol."
        elif target_type == "address":
            prompt = f"Perform a security risk assessment for blockchain address {target_id}."
        else:
            prompt = f"Perform a security risk assessment for {target_id}."
        
        # Query all available models
        tasks = []
        for provider in self.ai_providers:
            tasks.append(self._query_model(provider, prompt, context))
        
        responses_and_results = await asyncio.gather(*tasks)
        
        # Extract just the results
        results = [result for _, result in responses_and_results]
        
        # Aggregate findings using consensus learning
        overall_risk_level, findings, summary = await self._aggregate_findings(results)
        
        # Create the final assessment result
        return RiskAssessmentResult(
            target_type=target_type,
            target_id=target_id,
            overall_risk_level=overall_risk_level,
            findings=findings,
            summary=summary,
            timestamp=str(asyncio.get_event_loop().time()),
            metadata={
                "model_count": len(self.ai_providers),
                "context_length": len(context)
            }
        )


# Create a global instance of the risk assessment engine
risk_engine = RiskAssessmentEngine() 