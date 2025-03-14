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

import structlog
import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from flare_ai_defai import (
    ChatRouter,
    FlareProvider,
    GeminiProvider,
    PromptService,
    Vtpm,
)
from flare_ai_defai.api.contract_routes import router as contract_router
from flare_ai_defai.api.monitoring_routes import router as monitoring_router
from flare_ai_defai.api.risk_assessment_routes import router as risk_assessment_router
from flare_ai_defai.monitoring import (
    AlertService,
    BlockchainMonitor,
    NewsMonitor,
    AlertType,
    ConsoleAlertHandler,
    WebhookAlertHandler,
    TelegramBotHandler,
)
from flare_ai_defai.settings import settings

logger = structlog.get_logger(__name__)

# Global instances for monitoring services
alert_service = AlertService()
blockchain_monitor = None
news_monitor = None
telegram_bot_handler = None


async def initialize_monitoring_services():
    """Initialize and start the monitoring services."""
    global blockchain_monitor, news_monitor, telegram_bot_handler
    
    logger.info("Initializing monitoring services")
    
    # Initialize blockchain monitor
    blockchain_monitor = BlockchainMonitor()
    
    # Initialize news monitor
    news_monitor = NewsMonitor(api_key=settings.news_api_key)
    
    # Register alert handlers
    console_handler = ConsoleAlertHandler()
    alert_service.register_handler(AlertType.WHALE_TRANSACTION, console_handler)
    alert_service.register_handler(AlertType.UNUSUAL_ACTIVITY, console_handler)
    alert_service.register_handler(AlertType.VULNERABLE_CONTRACT, console_handler)
    alert_service.register_handler(AlertType.SECURITY_NEWS, console_handler)
    alert_service.register_handler(AlertType.PROTOCOL_COMPROMISE, console_handler)
    
    # Register webhook handler if URL is configured
    if settings.webhook_url:
        webhook_handler = WebhookAlertHandler(webhook_url=settings.webhook_url)
        alert_service.register_handler(AlertType.WHALE_TRANSACTION, webhook_handler)
        alert_service.register_handler(AlertType.PROTOCOL_COMPROMISE, webhook_handler)
    
    # Register Telegram bot handler if enabled and token is configured
    if settings.enable_telegram_bot and settings.telegram_bot_token:
        telegram_bot_handler = TelegramBotHandler(bot_token=settings.telegram_bot_token)
        
        # Register for all alert types
        alert_service.register_handler(AlertType.WHALE_TRANSACTION, telegram_bot_handler)
        alert_service.register_handler(AlertType.UNUSUAL_ACTIVITY, telegram_bot_handler)
        alert_service.register_handler(AlertType.VULNERABLE_CONTRACT, telegram_bot_handler)
        alert_service.register_handler(AlertType.SECURITY_NEWS, telegram_bot_handler)
        alert_service.register_handler(AlertType.PROTOCOL_COMPROMISE, telegram_bot_handler)
        
        # Start polling for Telegram updates
        await telegram_bot_handler.start_polling()
        logger.info("Telegram bot handler initialized and polling started")
    
    # Start monitoring services in background tasks
    asyncio.create_task(blockchain_monitor.start_monitoring(
        poll_interval=settings.monitoring_poll_interval
    ))
    asyncio.create_task(news_monitor.start_monitoring(
        poll_interval=settings.monitoring_poll_interval * 5  # Poll news less frequently
    ))
    
    logger.info("Monitoring services started")


async def shutdown_monitoring_services():
    """Shutdown the monitoring services."""
    global telegram_bot_handler
    
    logger.info("Shutting down monitoring services")
    
    # Stop Telegram bot polling if it was started
    if telegram_bot_handler is not None:
        await telegram_bot_handler.stop_polling()
        logger.info("Telegram bot polling stopped")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application.
    
    This handles startup and shutdown events for the application.
    """
    # Startup
    if settings.enable_monitoring:
        await initialize_monitoring_services()
    
    yield
    
    # Shutdown
    if settings.enable_monitoring:
        await shutdown_monitoring_services()


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
        title="Flare AI Agent API",
        description="API for interacting with the Flare AI Agent",
        version=settings.api_version,
        redirect_slashes=False,
        lifespan=lifespan,
    )

    # Configure CORS middleware with settings from configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add health check endpoint
    @app.get("/health")  # noqa: ARG001
    async def health_check():  # noqa: ARG001
        return {"status": "ok"}

    # Serve static files if available
    static_directory = "/usr/share/nginx/html"
    if os.path.exists(static_directory):
        logger.info(f"Static directory found at {static_directory}")
        app.mount("/static", StaticFiles(directory=f"{static_directory}/static"), name="static")
    else:
        logger.error(f"Static directory not found at {static_directory}")
        logger.error(f"Current directory contents: {os.listdir('/')}")

    # Serve index.html for the root path
    @app.get("/")  # noqa: ARG001
    async def serve_frontend(request: Request):  # noqa: ARG001
        index_path = f"{static_directory}/index.html"
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            logger.error(f"index.html not found at {index_path}")
            logger.error(f"Directory contents: {os.listdir(static_directory) if os.path.exists(static_directory) else 'static directory not found'}")
            return JSONResponse(status_code=404, content={"detail": "Frontend not found"})

    # Catch-all route for client-side routing
    @app.get("/{path:path}")  # noqa: ARG001
    async def catch_all(request: Request, path: str):  # noqa: ARG001
        # Skip API routes
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
            
        # First check if the path exists as a static file
        requested_path = f"{static_directory}/{path}"
        if os.path.exists(requested_path) and not os.path.isdir(requested_path):
            return FileResponse(requested_path)
        
        # If not, serve index.html for client-side routing
        index_path = f"{static_directory}/index.html"
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            logger.error(f"index.html not found at {index_path}")
            return JSONResponse(status_code=404, content={"detail": "Frontend not found"})

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
        prefix="/api/routes/contract",
        tags=["Contract Analysis"],
    )
    app.include_router(
        monitoring_router,
        prefix="/api/routes/monitoring",
        tags=["Monitoring"],
    )
    app.include_router(
        risk_assessment_router,
        prefix="/api/routes/risk-assessment",
        tags=["Risk Assessment"],
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

    uvicorn.run(app, host="0.0.0.0", port=8080)  # noqa: S104


if __name__ == "__main__":
    start()
