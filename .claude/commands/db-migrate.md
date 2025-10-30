Handle database migration: $ARGUMENTS (migration name)

1. Activate backend virtual environment
2. Create new Alembic migration:
   - `cd backend && source venv/bin/activate`
   - `alembic revision --autogenerate -m "$ARGUMENTS"`
3. Review generated migration file for correctness
4. Run migration on development database:
   - `alembic upgrade head`
5. Verify schema changes in database
6. Test rollback capability:
   - `alembic downgrade -1`
   - `alembic upgrade head`
7. Update model documentation if needed
8. Run tests to ensure models work correctly

Report migration status and any issues found.
