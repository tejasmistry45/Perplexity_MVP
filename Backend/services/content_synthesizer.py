import json
from typing import List, Dict, Any, Optional
from groq import AsyncGroq
from models.schemas import WebSearchResults, SearchResult, QueryAnalysis, SynthesizedResponse
from config.settings import settings
from services.citation_processor import SmartCitationProcessor
import logging
import re

logger = logging.getLogger(__name__)

class ContentSynthesizer:
    """Synthesizes search results into comprehensive, cited responses"""

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-120b"
        self.max_content_length = 4000   # Limit content per source
        # Initialize citation processor
        self.citation_processor = SmartCitationProcessor()

    async def synthesize_response(self, 
                                  query: str, 
                                  analysis: QueryAnalysis, 
                                  web_results: WebSearchResults,
                                  ) -> SynthesizedResponse:
        """Generate comprehensive response from search results"""

        logger.info(f"Synthesizing Response from {web_results.total_results} sources")

        # Step 1: Prepare and clean search Content
        processed_sources = self._process_search_results(web_results.results)

        if not processed_sources:
            logger.warning("No Valid Sources to synthesis from")
            return self._create_fallback_response(query)
        
        # Step 2: Create synthesis prompt
        synthesis_prompt = self._create_synthesis_prompt(
            query=query,
            analysis=analysis,
            sources=processed_sources
        )

        # Step 3: Generate response using Groq
        try: 
            synthesized_content = await self._generate_with_groq(synthesis_prompt)

            # Step 4: Process and validate response
            response = self._process_synthesized_response(
                content=synthesized_content,
                sources=processed_sources,
                query=query
            )

            logger.info(f"Response synthesized successfully")
            return response
        
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            return self._create_fallback_response(query, str(e))
        
    def _process_search_results(self, results: List[SearchResult]) -> List[Dict[str, Any]]:
        """Clean and prepare search results for synthesis"""

        processed = []

        for i, result in enumerate(results[:8]):  # Limit to top 8 results
            try:
                # Clean and truncate content
                content = self._clean_content(result.content)

                if len(content) < 10:  # skip very short content
                    continue

                # Truncate if too long
                if len(content) > self.max_content_length:
                    content = content[:self.max_content_length] + "..."

                source = {
                    "id": i + 1,
                    "title": result.title,
                    "url": result.url,
                    "content": content,
                    "score": result.score
                }

                processed.append(source)

            except Exception as e:
                logger.warning(f"Failed to process result {i}: {e}")
                continue

        logger.info(f"Processed {len(processed)} valid sources")
        return processed
    
    def _clean_content(self, content: str) -> str:
        """Clean and normalize content text"""
        
        # Remove extra whitespace and newlines
        content = re.sub(r'\s+', ' ', content)
        
        # Remove common web artifacts
        content = re.sub(r'(Cookie|Privacy Policy|Terms of Service).*', '', content)
        content = re.sub(r'Advertisement\s*', '', content, flags=re.IGNORECASE)
        
        # Remove HTML-like tags if any
        content = re.sub(r'<[^>]+>', '', content)
        
        return content.strip()
    
    def _create_synthesis_prompt(
    self, 
    query: str, 
    analysis: QueryAnalysis, 
    sources: List[Dict[str, Any]]
) -> str:
        """Create flexible synthesis prompt that adapts to query type"""
        
        # Build clean sources context
        sources_context = ""
        for i, source in enumerate(sources, 1):
            clean_content = source['content'].replace('\n', ' ').strip()
            # Limit content length to avoid token overflow
            if len(clean_content) > 800:
                clean_content = clean_content[:800] + "..."
            
            sources_context += f"\n[{i}] {source['title']}\n{clean_content}\n"

        # Determine response style based on query type
        if analysis.query_type in ["factual", "current_events"]:
            style_instruction = """
    Write a clear, direct answer that:
    1. Starts with the main answer in the first sentence
    2. Provides key details and context
    3. Includes relevant background information
    4. Uses natural paragraph structure
    5. Cites sources with [1], [2] format after relevant facts
    """
        elif analysis.query_type == "comparison":
            style_instruction = """
    Write a balanced comparison that:
    1. Briefly states the key differences upfront
    2. Compares main aspects side by side
    3. Provides context and background
    4. Uses clear paragraph structure
    5. Cites sources with [1], [2] format
    """
        elif analysis.query_type == "how_to":
            style_instruction = """
    Write a helpful guide that:
    1. Briefly explains what the process involves
    2. Lists key steps or methods
    3. Provides important details and tips
    4. Uses clear paragraph and bullet structure
    5. Cites sources with [1], [2] format
    """
        else:
            style_instruction = """
    Write a comprehensive answer that:
    1. Addresses the question directly
    2. Provides relevant details and context
    3. Uses natural paragraph structure
    4. Cites sources with [1], [2] format after key facts
    """

        prompt = f"""You are an expert research assistant creating a comprehensive answer.

    **Query**: "{query}"
    **Query Type**: {analysis.query_type}
    **Intent**: {analysis.search_intent}

    **Sources**:{sources_context}

    **Instructions**:
    {style_instruction}

    **Citation Rules**:
    - Use [1], [2], [3] etc. immediately after facts from sources
    - Every major claim needs a citation
    - Multiple sources can be cited like [1][2]
    - Don't over-cite obvious facts

    **Response Style**:
    - Write naturally like Perplexity - conversational but informative
    - Use clear paragraphs, not rigid templates
    - Include relevant details that answer the user's intent
    - Keep it comprehensive but readable
    - Use **bold** for emphasis on key names/terms
    - Use bullet points only when listing multiple items

    Generate a well-structured response now:"""

        return prompt




    
    async def _generate_with_groq(self, prompt: str) -> str:
        """Generate response using Groq LLM"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert research assistant that creates comprehensive, well-cited responses. Always use proper citations and maintain accuracy."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Low temperature for accuracy
                max_tokens=2000,  # Comprehensive responses
                top_p=0.9
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"❌ Groq generation failed: {e}")
            raise
    
    def _process_synthesized_response(
        self, 
        content: str, 
        sources: List[Dict[str, Any]], 
        query: str
    ) -> SynthesizedResponse:
        """Process response with intelligent citation placement"""
        
        # Clean content of any existing bad citations
        clean_content = re.sub(r'【\d+†source】', '', content)
        clean_content = re.sub(r'\[\d+†source\]', '', clean_content)
        
        # Apply intelligent citation placement
        try:
            cited_content = self.citation_processor.process_citations(clean_content, sources)
        except Exception as e:
            logger.error(f"Citation processing failed: {e}")
            cited_content = clean_content  # Fallback to content without citations
        
        # Extract final citations used
        citation_pattern = r'\[(\d+)\]'
        citations_used = set(re.findall(citation_pattern, cited_content))
        
        # Create source mapping
        cited_sources = []
        for source in sources:
            if str(source['id']) in citations_used:
                cited_sources.append({
                    "id": source['id'],
                    "title": source['title'],
                    "url": source['url']
                })
        
        return SynthesizedResponse(
            query=query,
            response=cited_content,
            sources_used=cited_sources,
            total_sources=len(sources),
            word_count=len(cited_content.split()),
            citation_count=len(citations_used),
            synthesis_quality_score=self._calculate_quality_score(
                cited_content, len(citations_used), len(cited_content.split())
            )
        )
    
    def _calculate_quality_score(self, content: str, citations: int, words: int) -> float:
        """Calculate quality score for the synthesized response"""
        
        score = 0.0
        
        # Citation density (good: 1 citation per 50-100 words)
        if words > 0:
            citation_density = citations / (words / 50)
            if 0.5 <= citation_density <= 2.0:
                score += 0.3
            elif citation_density > 0:
                score += 0.1
        
        # Content length (good: 200-800 words for most queries)
        if 200 <= words <= 800:
            score += 0.3
        elif words >= 100:
            score += 0.2
        
        # Structure indicators
        if '##' in content or '###' in content:  # Headers
            score += 0.1
        if '- ' in content or '* ' in content:  # Lists
            score += 0.1
        if citations > 2:  # Multiple sources
            score += 0.2
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _create_fallback_response(self, query: str, error: str = None) -> SynthesizedResponse:
        """Create fallback response when synthesis fails"""
        
        fallback_content = f"""
            I apologize, but I encountered difficulty synthesizing a comprehensive response for your query: "{query}".

            {f"Error details: {error}" if error else "This may be due to limited search results or processing issues."}

            Please try rephrasing your question or asking about a different topic.
            """
        
        return SynthesizedResponse(
            query=query,
            response=fallback_content,
            sources_used=[],
            total_sources=0,
            word_count=len(fallback_content.split()),
            citation_count=0,
            synthesis_quality_score=0.1
        )