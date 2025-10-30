Set up development environment:

1. Check prerequisites (Node.js 18+, Python 3.11+, Docker Desktop)
2. Run `make install` to install all dependencies
3. Copy and configure environment files:
   - `cp backend/.env.example backend/.env`
   - `cp app/.env.local.example app/.env.local`
4. Start Docker services with `docker-compose up -d`
5. Verify all services are healthy (PostgreSQL, Qdrant, Redis)
6. Test API endpoints: /health and /metrics
7. Open key URLs in browser:
   - Frontend: http://localhost:3000
   - API docs: http://localhost:8000/docs
   - Qdrant: http://localhost:6333/dashboard

Report any setup issues found.
