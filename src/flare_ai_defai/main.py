"""
AI Agent API Main Application Module

This module initializes and configures the FastAPI application for the AI Agent API.
It sets up CORS middleware, integrates various providers (AI, blockchain, attestation),
and configures the chat routing system.

Dependencies:
    - FastAPI for the web framework
    - Structlog for structured logging
    - CORS middleware for cross-origin resource sharing
    - Custom providers for AI, blockchain, and attestation services
"""

import os
from pathlib import Path

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from flare_ai_defai import (
    ChatRouter,
    FlareProvider,
    GeminiProvider,
    PromptService,
    Vtpm,
)
from flare_ai_defai.api.contract_routes import router as contract_router
from flare_ai_defai.settings import settings

logger = structlog.get_logger(__name__)


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application instance.

    This function:
    1. Creates a new FastAPI instance
    2. Configures CORS middleware with settings from the configuration
    3. Initializes required service providers:
       - GeminiProvider for AI capabilities
       - FlareProvider for blockchain interactions
       - Vtpm for attestation services
       - PromptService for managing chat prompts
    4. Sets up routing for chat and contract analysis endpoints

    Returns:
        FastAPI: Configured FastAPI application instance

    Configuration:
        The following settings are used from settings module:
        - api_version: API version string
        - cors_origins: List of allowed CORS origins
        - gemini_api_key: API key for Gemini AI service
        - gemini_model: Model identifier for Gemini AI
        - web3_provider_url: URL for Web3 provider
        - simulate_attestation: Boolean flag for attestation simulation
    """
    app = FastAPI(
        title="Flare AI DeFi API",
        description="AI-powered smart contract security analysis",
        version=settings.api_version,
    )

    # Configure CORS middleware with settings from configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint
    @app.get("/health")
    async def health_check() -> dict:
        """Health check endpoint."""
        return {"status": "healthy"}

    # Initialize router with service providers
    chat = ChatRouter(
        ai=GeminiProvider(api_key=settings.gemini_api_key, model=settings.gemini_model),
        blockchain=FlareProvider(web3_provider_url=settings.web3_provider_url),
        attestation=Vtpm(simulate=settings.simulate_attestation),
        prompts=PromptService(),
    )

    # Register routes with API
    app.include_router(chat.router, prefix="/api/routes/chat", tags=["chat"])
    app.include_router(
        contract_router,
        prefix="/api/routes/contracts",
        tags=["smart-contracts"],
    )

    # Serve static files from React build
    static_dir = Path("chat-ui/build")
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(static_dir / "static")), name="static")
        app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")

        @app.get("/{full_path:path}")
        async def serve_react_app(full_path: str):
            """Serve the React frontend."""
            static_file = static_dir / full_path
            if static_file.exists():
                return FileResponse(str(static_file))
            return FileResponse(str(static_dir / "index.html"))

    return app


app = create_app()


def start() -> None:
    """
    Start the FastAPI application server using uvicorn.

    This function initializes and runs the uvicorn server with the configuration:
    - Host: 0.0.0.0 (accessible from all network interfaces)
    - Port: 8080 (default HTTP port for the application)
    - App: The FastAPI application instance

    Note:
        This function is typically called when running the application directly,
        not when importing as a module.
    """
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)  # noqa: S104


if __name__ == "__main__":
    start()
