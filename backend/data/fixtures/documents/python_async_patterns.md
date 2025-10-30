# Python Async Programming Patterns

## Overview

Asynchronous programming in Python allows you to write concurrent code that can handle multiple operations simultaneously without blocking. This is particularly useful for I/O-bound operations like database queries, API calls, and file operations.

## Key Concepts

### Event Loop

The event loop is the core of every asyncio application. It runs asynchronous tasks and callbacks, performs network I/O operations, and runs subprocesses.

```python
import asyncio

async def main():
    print("Hello")
    await asyncio.sleep(1)
    print("World")

# Run the event loop
asyncio.run(main())
```

### Coroutines

Coroutines are functions defined with `async def` that can be paused and resumed.

```python
async def fetch_data(url):
    # Simulated async operation
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    data = await fetch_data("https://api.example.com")
    print(data)
```

### Tasks

Tasks are used to run coroutines concurrently.

```python
async def fetch_multiple_urls():
    urls = ["url1", "url2", "url3"]
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return results
```

## Database Patterns

### Async Database Connections

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    "postgresql+asyncpg://user:password@localhost/dbname"
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_user(user_id: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
```

### Connection Pooling

```python
engine = create_async_engine(
    database_url,
    pool_size=20,          # Number of connections to maintain
    max_overflow=0,        # Additional connections beyond pool_size
    pool_timeout=30,       # Timeout for getting connection
    pool_pre_ping=True,    # Verify connections before use
)
```

## FastAPI Integration

### Async Route Handlers

```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_from_db(db, user_id)
    return user
```

### Background Tasks

```python
from fastapi import BackgroundTasks

async def send_email(email: str, message: str):
    # Simulate sending email
    await asyncio.sleep(2)
    print(f"Email sent to {email}: {message}")

@app.post("/send-notification/")
async def create_notification(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email, email, "Welcome!")
    return {"message": "Notification queued"}
```

## Error Handling

### Exception Handling in Async Functions

```python
async def safe_api_call(url: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"HTTP error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return None
```

### Timeout Handling

```python
async def api_call_with_timeout(url: str, timeout: float = 5.0):
    try:
        async with asyncio.timeout(timeout):
            return await fetch_data(url)
    except asyncio.TimeoutError:
        logger.warning(f"Request to {url} timed out after {timeout}s")
        return None
```

## Performance Patterns

### Concurrent Processing

```python
async def process_items_concurrently(items: list, max_concurrent: int = 10):
    semaphore = asyncio.Semaphore(max_concurrent)

    async def process_with_limit(item):
        async with semaphore:
            return await process_item(item)

    tasks = [process_with_limit(item) for item in items]
    return await asyncio.gather(*tasks, return_exceptions=True)
```

### Batching Operations

```python
async def batch_database_operations(operations: list, batch_size: int = 100):
    results = []
    for i in range(0, len(operations), batch_size):
        batch = operations[i:i + batch_size]
        batch_results = await process_batch(batch)
        results.extend(batch_results)

        # Small delay between batches to avoid overwhelming the database
        await asyncio.sleep(0.1)

    return results
```

## Testing Async Code

### Basic Async Testing

```python
import pytest
import pytest_asyncio

@pytest_asyncio.async_test
async def test_async_function():
    result = await my_async_function()
    assert result == expected_value

# Alternative using asyncio
@pytest.mark.asyncio
async def test_async_function_alt():
    result = await my_async_function()
    assert result == expected_value
```

### Mocking Async Functions

```python
from unittest.mock import AsyncMock
import pytest

@pytest.mark.asyncio
async def test_with_async_mock():
    mock_db = AsyncMock()
    mock_db.get_user.return_value = {"id": 1, "name": "Test"}

    result = await service_function(mock_db)
    assert result["name"] == "Test"
    mock_db.get_user.assert_called_once()
```

## Best Practices

### 1. Always Use Async Context Managers

```python
# Good
async with httpx.AsyncClient() as client:
    response = await client.get(url)

# Bad - connection not properly closed
client = httpx.AsyncClient()
response = await client.get(url)
```

### 2. Use asyncio.gather() for Concurrent Operations

```python
# Good - concurrent execution
results = await asyncio.gather(
    fetch_data(url1),
    fetch_data(url2),
    fetch_data(url3)
)

# Bad - sequential execution
results = []
for url in urls:
    result = await fetch_data(url)
    results.append(result)
```

### 3. Handle Exceptions Properly

```python
# Good
try:
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for result in results:
        if isinstance(result, Exception):
            logger.error(f"Task failed: {result}")
        else:
            process_result(result)
except Exception as e:
    logger.error(f"Unexpected error: {e}")
```

### 4. Use Semaphores for Rate Limiting

```python
# Limit concurrent database connections
db_semaphore = asyncio.Semaphore(10)

async def database_operation():
    async with db_semaphore:
        # Database operation here
        pass
```

### 5. Avoid Blocking Operations

```python
# Bad - blocks the event loop
time.sleep(1)

# Good - non-blocking
await asyncio.sleep(1)

# For CPU-intensive tasks, use a thread pool
import concurrent.futures

async def cpu_intensive_task():
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, blocking_function)
    return result
```

## Common Pitfalls

1. **Mixing sync and async code incorrectly**
2. **Not awaiting coroutines**
3. **Using blocking I/O in async functions**
4. **Creating too many concurrent tasks without limits**
5. **Not handling exceptions in gather operations**

## Resources

- Python asyncio documentation: https://docs.python.org/3/library/asyncio.html
- SQLAlchemy async documentation: https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html
- FastAPI async documentation: https://fastapi.tiangolo.com/async/

This guide provides a foundation for writing efficient asynchronous Python applications, particularly in the context of web development and database operations.