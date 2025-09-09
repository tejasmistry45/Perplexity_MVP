from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from enum import Enum

class QueryType(str, Enum):
    FACTUAL = "factual"
    COMPARISON = "comparison"
    HOW_TO = "how_to"
    CURRENT_EVENTS = "current_events"
    OPINION = "opinion"
    CALCULATION = "calculation"

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class QueryAnalysis(BaseModel):
    query_type: str
    search_intent: str
    key_entities: List[str]
    suggested_searches: List[str]
    complexity_score: int = Field(..., ge=1, le=10)
    requires_real_time: bool = False

class SearchResult(BaseModel):
    title: str
    url: str
    content: str
    score: float
    calculated_score: Optional[float] = None
    published_date: Optional[str] = None

class WebSearchResults(BaseModel):
    total_results: int
    search_terms_used: List[str]
    results: List[SearchResult]
    search_duration: float  # in seconds

class SearchResponse(BaseModel):
    original_query: str
    analysis: QueryAnalysis
    web_results: Optional[WebSearchResults] = None
    status: str = "analyzed"
    timestamp: str