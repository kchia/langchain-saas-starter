Perform security scan:

1. Check for exposed secrets in code:
   - Search for API keys, tokens, passwords
   - Verify .env files are in .gitignore
   - Check recent commits for leaked credentials
2. Audit dependencies for vulnerabilities:
   - `npm audit` for frontend packages
   - `pip-audit` or safety check for Python packages
3. Validate authentication and authorization:
   - Review Auth.js configuration
   - Test protected routes
   - Check CORS settings
4. Review environment variable usage
5. Scan for common security anti-patterns
6. Generate security report with findings and recommendations

IMPORTANT: Never log or expose any found credentials.
