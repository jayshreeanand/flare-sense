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
from fastapi import FastAPI, HTTPException
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
    logger.info(f"Checking for frontend build at {static_dir}")
    
    # List contents of chat-ui directory for debugging
    chat_ui_dir = Path("chat-ui")
    if chat_ui_dir.exists():
        logger.info("Contents of chat-ui directory:")
        for item in chat_ui_dir.iterdir():
            logger.info(f"- {item}")
    else:
        logger.error("chat-ui directory not found")
    
    if static_dir.exists():
        logger.info("Contents of build directory:")
        for item in static_dir.iterdir():
            logger.info(f"- {item}")
            
        static_files_dir = static_dir / "static"
        if not static_files_dir.exists():
            logger.error(f"Static files directory not found at {static_files_dir}")
            raise HTTPException(
                status_code=500,
                detail=f"Frontend static files not found at {static_files_dir}. Contents of {static_dir}: {list(static_dir.iterdir())}"
            )

        # Mount static files
        app.mount("/static", StaticFiles(directory=str(static_files_dir)), name="static")
        
        index_html = static_dir / "index.html"
        if not index_html.exists():
            logger.error(f"index.html not found at {index_html}")
            raise HTTPException(
                status_code=500,
                detail=f"Frontend index.html not found at {index_html}. Contents of {static_dir}: {list(static_dir.iterdir())}"
            )

        logger.info("Frontend build directory verified successfully")
        
        # Serve index.html for the root path
        @app.get("/")
        async def serve_root():
            return FileResponse(str(index_html))
            
        # Serve index.html for any unmatched routes (client-side routing)
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            # First try to serve actual files
            file_path = static_dir / full_path
            if file_path.exists() and file_path.is_file():
                return FileResponse(str(file_path))
            # Otherwise serve index.html for client-side routing
            return FileResponse(str(index_html))
    else:
        logger.error(f"Frontend build directory not found at {static_dir}")
        # List the current directory contents for debugging
        current_dir = Path(".")
        logger.error("Current directory contents:")
        for item in current_dir.iterdir():
            logger.error(f"- {item}")
            
        @app.get("/")
        async def serve_root():
            raise HTTPException(
                status_code=500,
                detail=f"Frontend not built. Build directory not found at {static_dir}. Current directory contains: {list(current_dir.iterdir())}"
            )

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

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)  # noqa: S104


if __name__ == "__main__":
    start()
