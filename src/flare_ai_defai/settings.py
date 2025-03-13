"""
Settings Configuration Module

This module defines the configuration settings for the AI Agent API
using Pydantic's BaseSettings. It handles environment variables and
provides default values for various service configurations.

The settings can be overridden by environment variables or through a .env file.
Environment variables take precedence over values defined in the .env file.
"""

import structlog
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Annotated
from pydantic import Field

logger = structlog.get_logger(__name__)


class Settings(BaseSettings):
    """
    Application settings model that provides configuration for all components.
    """

    # Flag to enable/disable attestation simulation
    simulate_attestation: bool = True
    # Restrict backend listener to specific IPs
    cors_origins: list[str] = ["*"]
    # API key for accessing Google's Gemini AI service
    gemini_api_key: Annotated[str, Field(min_length=1)]
    # The Gemini model identifier to use
    gemini_model: str = "gemini-2.0-flash"
    # API version to use at the backend
    api_version: str = "0.1.0"
    # URL for the Flare Network RPC provider
    web3_provider_url: Annotated[str, Field(min_length=1)]
    # URL for the Flare Network block explorer
    web3_explorer_url: Annotated[str, Field(min_length=1)]
    # Chain ID for Flare network
    chain_id: int = 114  # Coston2 testnet chain ID
    # Reference image for tee
    tee_image_reference: str = "ghcr.io/flare-foundation/flare-ai-defai:main"
    # Instance name
    instance_name: str = "flare-sense"

    model_config = SettingsConfigDict(
        # This enables .env file support
        env_file=".env",
        # If .env file is not found, don't raise an error
        env_file_encoding="utf-8",
        # Optional: you can also specify multiple .env files
        extra="ignore",
        case_sensitive=True,
    )


# Create a global settings instance
settings = Settings()
logger.debug("settings", settings=settings.model_dump())
