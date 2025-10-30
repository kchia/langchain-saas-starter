# Backend Cursor Rules for FastAPI/Python

## Backend-Specific Guidelines

### FastAPI/Python Patterns

- Use async/await patterns consistently for all I/O operations
- Follow FastAPI best practices with proper dependencies
- Use Pydantic models for all request/response validation
- Implement structured error handling with custom exceptions
- Use dependency injection for database and service connections
- Follow PEP 8 with black formatter and isort for imports
- Implement proper logging with structured format (JSON)
- Use SQLAlchemy async sessions with proper context management
- Implement request validation and sanitization
- Use proper HTTP status codes and error responses
- Implement rate limiting and request timeouts

### Database & Services

- Use async SQLAlchemy patterns with proper session management
- Implement connection pooling with appropriate limits
- Use Alembic for migrations with proper rollback strategies
- Follow Redis caching patterns with proper TTL
- Use Qdrant for vector operations with proper indexing
- Implement proper transaction management
- Use database migrations for schema changes
- Cache frequently accessed data appropriately
- Monitor database performance and query efficiency

### AI/ML Patterns (LangChain/LangGraph)

- Structure LangChain workflows as composable functions
- Use LangGraph for multi-agent orchestration and state management
- Use LangSmith for comprehensive AI observability and tracing
- Use proper error handling for AI model calls with retries
- Implement streaming responses for long-running AI operations
- Use proper vector search patterns with Qdrant
- Cache expensive AI operations appropriately
- Log AI interactions for debugging and monitoring
- Use environment variables for model configurations
- Implement proper prompt templates and versioning
- Handle AI model failures gracefully with fallbacks
- Follow LangGraph patterns for complex AI workflows
- Use Pillow for image preprocessing before vision model calls
- Implement confidence scoring for AI outputs
- Use proper agent state management patterns

### Security Patterns

- Validate all inputs using Pydantic models
- Sanitize user inputs before database operations
- Use parameterized queries to prevent SQL injection
- Implement proper CORS configuration
- Use HTTPS in production with proper headers
- Secure environment variables and secrets
- Implement proper session management
- Use rate limiting for API endpoints
- Log security-related events appropriately
- Implement proper authentication and authorization flows

## Backend Anti-Patterns to Avoid

### Code Quality

- Don't use synchronous database operations
- Don't ignore proper error handling patterns
- Don't hardcode values (use environment variables)
- Don't create overly complex functions or classes
- Don't ignore type hints or use 'Any' types
- Don't skip input validation and sanitization

### AI/ML Specific

- Don't make AI calls without proper error handling
- Don't ignore vector search optimization
- Don't cache AI responses without considering staleness
- Don't expose sensitive prompts or model configurations
- Don't ignore streaming for long-running AI operations

### Performance

- Don't ignore database query optimization
- Don't ignore proper caching strategies
- Don't create unnecessary database connections
- Don't ignore async/await patterns for I/O operations
