"""
Smart Contract Security Analyzer

This module provides functionality for analyzing smart contracts for security vulnerabilities,
performing risk assessments, and monitoring contract behavior on the Flare network.
"""

from dataclasses import dataclass
from enum import Enum
from typing import TypeAlias

import structlog
from web3 import Web3

from flare_ai_defai.ai.base import BaseAIProvider
from flare_ai_defai.prompts.templates import (
    LIVE_MONITORING_PROMPT,
    SECURITY_RISK_ASSESSMENT_PROMPT,
    SMART_CONTRACT_ANALYSIS_PROMPT,
)

logger = structlog.get_logger(__name__)

# Type aliases
VulnerabilityList: TypeAlias = list[Vulnerability]
GasSuggestionList: TypeAlias = list[str]
MonitoringResult: TypeAlias = list[dict]


class Severity(str, Enum):
    """Severity levels for identified vulnerabilities."""

    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class Vulnerability:
    """Represents a detected vulnerability in a smart contract."""

    name: str
    description: str
    severity: Severity
    location: str | None  # File and line number if available
    fix_recommendation: str


@dataclass
class SecurityAnalysis:
    """Results of a smart contract security analysis."""

    risk_score: float  # 0-100
    vulnerabilities: VulnerabilityList
    gas_optimization_suggestions: GasSuggestionList
    overall_assessment: str


class ContractAnalyzer:
    """
    Analyzes smart contracts for security vulnerabilities and monitors their behavior.

    This class combines AI-powered analysis with blockchain data monitoring to provide
    comprehensive security assessments of smart contracts on the Flare network.
    """

    def __init__(
        self, ai_provider: BaseAIProvider, web3_provider: Web3, chain_id: int
    ) -> None:
        """
        Initialize the contract analyzer.

        Args:
            ai_provider: AI provider for analysis (Gemini)
            web3_provider: Web3 instance for blockchain interaction
            chain_id: Chain ID of the target network
        """
        self.ai = ai_provider
        self.web3 = web3_provider
        self.chain_id = chain_id
        self.logger = logger.bind(service="contract_analyzer")

    async def analyze_contract(self, contract_code: str) -> SecurityAnalysis:
        """
        Perform a comprehensive security analysis of a smart contract.

        Args:
            contract_code: Source code of the smart contract

        Returns:
            SecurityAnalysis containing risk assessment and recommendations
        """
        # Initial analysis using AI
        initial_response = self.ai.generate(
            SMART_CONTRACT_ANALYSIS_PROMPT.format(contract_code=contract_code)
        )

        # Deep risk assessment
        risk_response = self.ai.generate(
            SECURITY_RISK_ASSESSMENT_PROMPT.format(initial_analysis=initial_response.text)
        )

        # Parse and structure the results
        vulnerabilities = self._parse_vulnerabilities(
            initial_response.text, risk_response.text
        )
        risk_score = self._calculate_risk_score(vulnerabilities)
        gas_suggestions = self._extract_gas_suggestions(initial_response.text)

        return SecurityAnalysis(
            risk_score=risk_score,
            vulnerabilities=vulnerabilities,
            gas_optimization_suggestions=gas_suggestions,
            overall_assessment=risk_response.text,
        )

    async def monitor_contract(
        self, contract_address: str, num_blocks: int = 1000
    ) -> MonitoringResult:
        """
        Monitor a contract's recent activity for suspicious patterns.

        Args:
            contract_address: Address of the contract to monitor
            num_blocks: Number of recent blocks to analyze

        Returns:
            List of suspicious activities detected
        """
        # Get recent transactions
        latest_block = await self.web3.eth.block_number
        start_block = max(0, latest_block - num_blocks)

        recent_txs = []
        for block_num in range(start_block, latest_block + 1):
            block = await self.web3.eth.get_block(block_num, full_transactions=True)
            contract_txs = [
                tx
                for tx in block["transactions"]
                if tx["to"] and tx["to"].lower() == contract_address.lower()
            ]
            recent_txs.extend(contract_txs)

        # Analyze transactions using AI
        monitoring_response = self.ai.generate(
            LIVE_MONITORING_PROMPT.format(
                contract_address=contract_address,
                recent_txs=str(recent_txs[-10:]),  # Last 10 transactions for brevity
            )
        )

        return self._parse_monitoring_results(monitoring_response.text)

    def _parse_vulnerabilities(
        self, initial_analysis: str, risk_assessment: str
    ) -> VulnerabilityList:
        """Parse vulnerability information from AI responses."""
        # Implementation will use AI to structure the free-form text into Vulnerability objects
        vulnerabilities = []
        
        # Use AI to extract structured vulnerability information
        extraction_prompt = f"""
        From the following security analysis, extract vulnerabilities in this format:
        - Name
        - Description
        - Severity (CRITICAL/HIGH/MEDIUM/LOW)
        - Fix recommendation

        Analysis text:
        {initial_analysis}

        Risk assessment:
        {risk_assessment}
        """
        
        extraction_response = self.ai.generate(extraction_prompt)
        
        # Parse the structured response into Vulnerability objects
        # This is a simplified version - in practice, we'd use more robust parsing
        for line in extraction_response.text.split("\n"):
            if line.startswith("- "):
                parts = line.split("|")
                if len(parts) >= 4:
                    vulnerabilities.append(
                        Vulnerability(
                            name=parts[0].strip("- "),
                            description=parts[1].strip(),
                            severity=Severity(parts[2].strip().upper()),
                            location=None,
                            fix_recommendation=parts[3].strip(),
                        )
                    )
        
        return vulnerabilities

    def _calculate_risk_score(self, vulnerabilities: VulnerabilityList) -> float:
        """Calculate overall risk score based on vulnerabilities."""
        if not vulnerabilities:
            return 0.0

        # Severity weights
        weights = {
            Severity.CRITICAL: 1.0,
            Severity.HIGH: 0.7,
            Severity.MEDIUM: 0.4,
            Severity.LOW: 0.1,
        }

        # Calculate weighted score
        total_weight = sum(weights[v.severity] for v in vulnerabilities)
        max_possible_weight = len(vulnerabilities)  # If all were CRITICAL

        # Normalize to 0-100 scale
        return min(100.0, (total_weight / max_possible_weight) * 100)

    def _extract_gas_suggestions(self, analysis_text: str) -> GasSuggestionList:
        """Extract gas optimization suggestions from analysis text."""
        # Use AI to extract gas optimization suggestions
        extraction_prompt = f"""
        From the following analysis, extract specific gas optimization suggestions.
        List each suggestion on a new line starting with "- ".

        Analysis text:
        {analysis_text}
        """
        
        extraction_response = self.ai.generate(extraction_prompt)
        
        # Parse suggestions
        suggestions = []
        for line in extraction_response.text.split("\n"):
            if line.startswith("- "):
                suggestions.append(line[2:].strip())
        
        return suggestions

    def _parse_monitoring_results(self, monitoring_text: str) -> MonitoringResult:
        """Parse monitoring results into structured format."""
        # Use AI to extract structured monitoring results
        extraction_prompt = f"""
        From the following monitoring analysis, extract suspicious activities in this format:
        - Type of activity
        - Description
        - Risk level
        - Recommendation

        Monitoring text:
        {monitoring_text}
        """
        
        extraction_response = self.ai.generate(extraction_prompt)
        
        # Parse the structured response
        results = []
        current_activity = {}
        
        for line in extraction_response.text.split("\n"):
            if line.startswith("Type: "):
                if current_activity:
                    results.append(current_activity)
                current_activity = {"type": line[6:].strip()}
            elif line.startswith("Description: "):
                current_activity["description"] = line[12:].strip()
            elif line.startswith("Risk: "):
                current_activity["risk_level"] = line[6:].strip()
            elif line.startswith("Recommendation: "):
                current_activity["recommendation"] = line[15:].strip()
        
        if current_activity:
            results.append(current_activity)
        
        return results 