# Database Design Principles for AI Applications

## Introduction

Effective database design is crucial for AI applications, especially those involving large datasets, vector embeddings, and real-time processing. This document outlines key principles and patterns for designing databases that support AI workloads.

## Core Design Principles

### 1. Normalization vs. Denormalization

**When to Normalize**
- Transactional data (users, orders, transactions)
- Frequently updated data
- Data with complex relationships
- When storage space is a concern

**When to Denormalize**
- Read-heavy analytics workloads
- Vector embeddings and metadata
- Caching layers
- Reporting and dashboard data

### 2. Indexing Strategy

**Primary Indexes**
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_user_active_created ON users(is_active, created_at);
CREATE INDEX idx_document_status_type ON documents(processing_status, content_type);
```

**Vector Indexes**
```sql
-- For similarity search (PostgreSQL with pgvector)
CREATE INDEX idx_document_embedding ON document_embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);
```

**Partial Indexes**
```sql
-- Index only active records
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;
```

### 3. Partitioning for Scale

**Time-Based Partitioning**
```sql
-- Partition large tables by time
CREATE TABLE conversations (
    id SERIAL,
    user_id INTEGER,
    created_at TIMESTAMP,
    -- other columns
) PARTITION BY RANGE (created_at);

CREATE TABLE conversations_2024_q1 PARTITION OF conversations
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

**Hash Partitioning**
```sql
-- Distribute data evenly across partitions
CREATE TABLE user_activities (
    id SERIAL,
    user_id INTEGER,
    -- other columns
) PARTITION BY HASH (user_id);
```

## Schema Design Patterns

### 1. User and Authentication

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
```

### 2. Document Management

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    processing_status VARCHAR(50) DEFAULT 'pending',
    extracted_text TEXT,
    metadata JSONB,
    uploaded_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_documents_hash ON documents(content_hash);
CREATE INDEX idx_documents_status ON documents(processing_status);
CREATE INDEX idx_documents_uploader ON documents(uploaded_by_id);
CREATE INDEX idx_documents_type ON documents(content_type);

-- Composite index for filtering
CREATE INDEX idx_documents_status_created ON documents(processing_status, created_at);
```

### 3. Vector Embeddings

```sql
CREATE TABLE document_embeddings (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI embedding dimension
    token_count INTEGER NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);

-- Vector similarity index
CREATE INDEX idx_document_embedding_vector ON document_embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);

-- Regular indexes
CREATE INDEX idx_document_embedding_doc ON document_embeddings(document_id);
CREATE INDEX idx_document_embedding_model ON document_embeddings(model_name);
```

### 4. Conversation and Messages

```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    title VARCHAR(500) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    system_prompt TEXT,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    status VARCHAR(50) DEFAULT 'active',
    message_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    message_index INTEGER NOT NULL,
    parent_message_id INTEGER REFERENCES messages(id),
    token_usage JSONB, -- Store token counts and costs
    context_documents JSONB, -- References to retrieved documents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, message_index)
);

-- Indexes for efficient queries
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
```

## Performance Optimization

### 1. Connection Pooling

```python
# SQLAlchemy connection pool configuration
engine = create_async_engine(
    database_url,
    pool_size=20,           # Base number of connections
    max_overflow=30,        # Additional connections beyond pool_size
    pool_timeout=30,        # Timeout for getting connection
    pool_recycle=3600,      # Recycle connections after 1 hour
    pool_pre_ping=True,     # Verify connections before use
)
```

### 2. Query Optimization

**Use EXPLAIN ANALYZE**
```sql
EXPLAIN ANALYZE SELECT * FROM documents
WHERE processing_status = 'completed'
AND created_at > '2024-01-01'
ORDER BY created_at DESC
LIMIT 10;
```

**Optimize Common Queries**
```sql
-- Bad: Full table scan
SELECT * FROM messages WHERE content LIKE '%AI%';

-- Good: Use full-text search
ALTER TABLE messages ADD COLUMN content_tsvector tsvector;
CREATE INDEX idx_messages_fts ON messages USING gin(content_tsvector);

-- Update trigger to maintain tsvector
CREATE OR REPLACE FUNCTION update_content_tsvector()
RETURNS trigger AS $$
BEGIN
    NEW.content_tsvector := to_tsvector('english', NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Caching Strategy

**Application-Level Caching**
```python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiry=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"

            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiry, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_result(expiry=1800)  # Cache for 30 minutes
async def get_user_conversations(user_id: int):
    # Database query here
    pass
```

**Database-Level Caching**
```sql
-- Use materialized views for expensive aggregations
CREATE MATERIALIZED VIEW user_conversation_stats AS
SELECT
    u.id as user_id,
    u.username,
    COUNT(c.id) as conversation_count,
    SUM(c.total_tokens_used) as total_tokens,
    MAX(c.last_message_at) as last_activity
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
GROUP BY u.id, u.username;

-- Refresh periodically
REFRESH MATERIALIZED VIEW user_conversation_stats;
```

## Data Integrity and Constraints

### 1. Foreign Key Constraints

```sql
-- Ensure referential integrity
ALTER TABLE conversations
ADD CONSTRAINT fk_conversations_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Soft deletes for important data
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_users_not_deleted ON users(id) WHERE deleted_at IS NULL;
```

### 2. Check Constraints

```sql
-- Validate data at database level
ALTER TABLE conversations
ADD CONSTRAINT chk_temperature_range
CHECK (temperature >= 0.0 AND temperature <= 2.0);

ALTER TABLE messages
ADD CONSTRAINT chk_valid_role
CHECK (role IN ('user', 'assistant', 'system'));

ALTER TABLE documents
ADD CONSTRAINT chk_file_size_positive
CHECK (file_size > 0);
```

### 3. Triggers for Data Consistency

```sql
-- Auto-update conversation message count
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations
        SET message_count = message_count + 1,
            last_message_at = NEW.created_at
        WHERE id = NEW.conversation_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE conversations
        SET message_count = message_count - 1
        WHERE id = OLD.conversation_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_stats
    AFTER INSERT OR DELETE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_stats();
```

## Security Considerations

### 1. Row-Level Security

```sql
-- Enable RLS on sensitive tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY user_conversations_policy ON conversations
    FOR ALL TO app_user
    USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

### 2. Data Encryption

```sql
-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted API keys
ALTER TABLE users ADD COLUMN encrypted_api_key BYTEA;

-- Encrypt/decrypt functions
CREATE OR REPLACE FUNCTION encrypt_api_key(api_key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(api_key, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

## Monitoring and Maintenance

### 1. Database Monitoring

```sql
-- Monitor slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 2. Automated Maintenance

```sql
-- Auto-vacuum configuration
ALTER TABLE documents SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

-- Partition maintenance function
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name TEXT, start_date DATE)
RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';

    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

## Best Practices Summary

1. **Design for your query patterns** - Index columns used in WHERE, ORDER BY, and JOIN clauses
2. **Use appropriate data types** - Don't use TEXT for everything
3. **Implement proper constraints** - Ensure data integrity at the database level
4. **Plan for scale** - Consider partitioning and sharding early
5. **Monitor performance** - Regularly review slow queries and optimize
6. **Backup and recovery** - Implement automated backups and test recovery procedures
7. **Security first** - Use RLS, encryption, and principle of least privilege

This guide provides a foundation for designing robust, scalable databases for AI applications. Adapt these patterns based on your specific requirements and scale.