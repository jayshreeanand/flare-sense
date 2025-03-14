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
    gemini_api_key: Annotated[str, Field(min_length=1, alias="GEMINI_API_KEY")]
    # The Gemini model identifier to use
    gemini_model: str = Field(default="gemini-2.0-flash", alias="GEMINI_MODEL")
    # API key for accessing OpenRouter AI service (optional)
    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")
    # API version to use at the backend
    api_version: str = Field(default="0.1.0", alias="API_VERSION")
    # URL for the Flare Network RPC provider
    web3_provider_url: Annotated[str, Field(min_length=1, alias="WEB3_PROVIDER_URL")]
    # URL for the Flare Network block explorer
    web3_explorer_url: Annotated[str, Field(min_length=1, alias="WEB3_EXPLORER_URL")]
    # Chain ID for Flare network
    chain_id: int = Field(default=114, alias="CHAIN_ID")  # Coston2 testnet chain ID
    # Reference image for tee
    tee_image_reference: str = Field(default="ghcr.io/flare-foundation/flare-ai-defai:main", alias="TEE_IMAGE_REFERENCE")
    # Instance name
    instance_name: str = Field(default="flare-sense", alias="INSTANCE_NAME")
    
    # Monitoring settings
    enable_monitoring: bool = Field(default=True, alias="ENABLE_MONITORING")
    monitoring_poll_interval: int = Field(default=60, alias="MONITORING_POLL_INTERVAL")  # seconds
    whale_threshold: float = Field(default=10000, alias="WHALE_THRESHOLD")  # in FLR
    news_api_key: str = Field(default="", alias="NEWS_API_KEY")
    webhook_url: str = Field(default="", alias="WEBHOOK_URL")
    enable_notifications: bool = Field(default=True, alias="ENABLE_NOTIFICATIONS")
    
    # Telegram bot settings
    telegram_bot_token: str = Field(default="", alias="TELEGRAM_BOT_TOKEN")
    enable_telegram_bot: bool = Field(default=False, alias="ENABLE_TELEGRAM_BOT")

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
