Check system health:

1. Verify Docker services are running (`docker-compose ps`)
2. Test database connections:
   - PostgreSQL on port 5432
   - Qdrant on port 6333
   - Redis on port 6379
3. Check API endpoints:
   - GET /health (should return {"status": "healthy"})
   - GET /metrics (Prometheus metrics)
4. Validate environment variables are set
5. Run quick smoke tests:
   - Backend: `pytest tests/test_health.py -v`
   - Frontend: Basic page load test
6. Check service logs for errors
7. Report any issues found with suggested fixes
