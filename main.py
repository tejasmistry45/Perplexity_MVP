from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import uvicorn
import logging

from models.schemas import SearchRequest, SearchResponse
from services.query_analyzer import QueryAnalyzer
from services.search_orchestrator import SearchOrchestrator
from config.settings import settings
from logger_config import setup_logger

setup_logger()
# configure logging
logger = logging.getLogger(__name__)

# Initialize services
query_analyzer = QueryAnalyzer()

# Initialize orchestrator
search_orchestrator = SearchOrchestrator()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    logger.info("Perplexity MVP Starting Up. :)")
    yield
    logger.info("Perplexity MVP Shutting Down. :(")

# Create FastAPI app
app = FastAPI(
    title= settings.app_name,
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middelware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
   """Health check point"""
   return {
       "message": "Perplexity MVP API is Running. :)",
       "status": "Healthy",
       "timestamp": datetime.now().isoformat()
   }

@app.post("/search", response_model=SearchResponse)
async def search_endpoint(request: SearchRequest):
    """Main search endpoint - Step 1: Query Analysis"""

    try:
        logger.info(f"Recived Query: {request.query}")

        # 1. Analyze the query
        analysis = await query_analyzer.process_query(request)
        logger.info(f"Query Analysis Complete: {analysis}")

        # Create Response
        response = SearchResponse(
            original_query=request.query,
            analysis=analysis,
            timestamp=datetime.now().isoformat()
        )

        return response

    except Exception as e:
        logger.error(f"Error Processing Query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "groq": "connected",  # Add actual health checks later
            "tavily": "pending"   # Will add in next step
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )


