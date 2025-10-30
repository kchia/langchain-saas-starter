# Database Schema Documentation

## Overview

ComponentForge uses **PostgreSQL 16** as the primary relational database with **SQLAlchemy 2.0** ORM for async database operations. The schema supports:

- User authentication and authorization
- RAG (Retrieval-Augmented Generation) document storage
- Vector embeddings integration with Qdrant
- Conversation and chat message tracking
- AI model evaluation and metrics
- Epic 2 requirement export workflow tracking

**Key Technologies**:
- **PostgreSQL 16** - Primary database
- **SQLAlchemy 2.0** - Async ORM with asyncpg driver
- **asyncpg** - High-performance async PostgreSQL driver
- **Alembic** - Database migrations (planned, not yet implemented)
- **Qdrant** - Vector database (external, referenced via vector_id)

---

## Database Configuration

### Connection Settings

```python
# backend/src/core/database.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# Async engine for application queries
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost:5432/componentforge",
    pool_size=20,              # Connection pool size
    max_overflow=10,           # Additional connections when pool is full
    pool_timeout=30,           # Seconds to wait for connection
    pool_pre_ping=True,        # Verify connection before using
    echo=False,                # Disable SQL query logging in production
    pool_recycle=3600          # Recycle connections after 1 hour
)

# Session factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False     # Keep objects accessible after commit
)

# Sync engine for migrations
sync_engine = create_engine(
    "postgresql://user:pass@localhost:5432/componentforge",
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

### Environment Variables

```bash
# Required in backend/.env
DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/dbname"
DATABASE_SYNC_URL="postgresql://user:pass@host:5432/dbname"  # For migrations

# Optional connection tuning
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
```

---

## Schema Overview

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
└────────┬────────┘
         │ 1
         │
         │ N
    ┌────┴────┬──────────────────┐
    │         │                  │
┌───▼────┐ ┌──▼──────────┐ ┌────▼────────────┐
│Document│ │Conversation │ │RequirementExport│
└───┬────┘ └──┬──────────┘ └─────────────────┘
    │ 1       │ 1
    │         │
    │ N       │ N
┌───▼─────────┐ ┌───▼────┐
│DocumentChunk│ │Message │
└─────────────┘ └───┬────┘
                    │ parent_id (self-referential)
                    │
                    └──────┐
                           │
                        ┌──▼────┐
                        │Message│
                        └───────┘

┌──────────────┐     ┌───────────────┐
│EmbeddingModel│     │EvaluationRun  │
└──────────────┘     └───────────────┘
```

### Tables Summary

| Table | Rows (Est.) | Purpose | Key Features |
|-------|------------|---------|--------------|
| **users** | 100-10K | Authentication | Email/username, roles, preferences |
| **documents** | 1K-100K | RAG system | File uploads, processing status |
| **document_chunks** | 10K-1M | Vector search | Qdrant integration, embeddings |
| **conversations** | 1K-100K | Chat sessions | Token tracking, model configs |
| **messages** | 10K-1M | Chat history | Thread support, context tracking |
| **embedding_models** | 10-100 | Model tracking | Provider, dimensions, tokens |
| **evaluation_runs** | 100-10K | AI metrics | Performance, quality scores |
| **requirement_exports** | 1K-100K | Epic 2 workflow | Approval tracking, latency metrics |

---

## Core Models

### TimestampMixin

**Purpose**: Provides automatic timestamp tracking for all models.

```python
class TimestampMixin:
    """Mixin for automatic timestamp fields."""

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
```

**Usage**: All models inherit from `TimestampMixin` and `Base`.

**Benefits**:
- Automatic created_at on insert
- Automatic updated_at on update
- Timezone-aware timestamps
- Server-side defaults (database-enforced)

---

## Authentication & Users

### User Model

**Table**: `users`

**Purpose**: User authentication, authorization, and preference storage.

```python
class User(Base, TimestampMixin):
    __tablename__ = "users"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Authentication
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Authorization
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    # User Data
    preferences = Column(JSON, default=dict)  # UI settings, defaults, etc.
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    requirement_exports = relationship("RequirementExport", back_populates="user", cascade="all, delete-orphan")
```

**Indexes**:
- `id` (PRIMARY KEY)
- `email` (UNIQUE, for login)
- `username` (UNIQUE, for display)

**Sample Data**:

```python
user = User(
    email="dev@componentforge.com",
    username="developer",
    hashed_password="$2b$12$...",  # bcrypt hash
    is_active=True,
    is_admin=False,
    preferences={
        "theme": "dark",
        "defaultModel": "gpt-4",
        "defaultTemperature": 0.7
    },
    last_login_at="2025-10-08T10:30:00Z"
)
```

**Common Queries**:

```python
# Authenticate user
from sqlalchemy import select

async def get_user_by_email(email: str, session: AsyncSession):
    result = await session.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()

# Get active users
async def get_active_users(session: AsyncSession):
    result = await session.execute(
        select(User).where(User.is_active == True).order_by(User.created_at.desc())
    )
    return result.scalars().all()
```

---

## RAG Document Storage

### Document Model

**Table**: `documents`

**Purpose**: Stores uploaded files for RAG (Retrieval-Augmented Generation) system.

```python
class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Document Metadata
    title = Column(String(500), nullable=False)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    content_type = Column(String(100), nullable=True)  # MIME type

    # Processing Status
    processing_status = Column(
        String(50),
        default="pending",  # pending, processing, completed, failed
        nullable=False,
        index=True
    )

    # Extracted Content
    extracted_text = Column(Text, nullable=True)

    # Embedding Metadata
    embedding_model = Column(String(100), nullable=True)  # e.g., "text-embedding-3-small"
    chunk_count = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
```

**Indexes**:
- `id` (PRIMARY KEY)
- `user_id` (for user's documents)
- `processing_status` (for job queue)

**Processing Workflow**:

1. **Upload**: `processing_status = "pending"`
2. **Extract**: Extract text → `extracted_text`, `processing_status = "processing"`
3. **Chunk**: Split into chunks → create `DocumentChunk` records
4. **Embed**: Generate embeddings → store in Qdrant
5. **Complete**: `processing_status = "completed"`, `chunk_count = N`

**Sample Data**:

```python
document = Document(
    user_id=1,
    title="Design System Patterns",
    filename="design-patterns.pdf",
    file_path="/uploads/2025/10/08/design-patterns.pdf",
    content_type="application/pdf",
    processing_status="completed",
    extracted_text="# Button Patterns\n\nPrimary buttons should...",
    embedding_model="text-embedding-3-small",
    chunk_count=42
)
```

**Common Queries**:

```python
# Get user's completed documents
async def get_user_documents(user_id: int, session: AsyncSession):
    result = await session.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .where(Document.processing_status == "completed")
        .order_by(Document.created_at.desc())
    )
    return result.scalars().all()

# Get pending processing jobs
async def get_pending_documents(session: AsyncSession):
    result = await session.execute(
        select(Document)
        .where(Document.processing_status == "pending")
        .order_by(Document.created_at.asc())
        .limit(10)
    )
    return result.scalars().all()
```

---

### DocumentChunk Model

**Table**: `document_chunks`

**Purpose**: Stores text chunks with vector embeddings for semantic search.

```python
class DocumentChunk(Base, TimestampMixin):
    __tablename__ = "document_chunks"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)

    # Chunk Data
    chunk_index = Column(Integer, nullable=False)  # Position in document (0-based)
    content = Column(Text, nullable=False)

    # Vector Integration
    vector_id = Column(String(100), nullable=True, index=True)  # Qdrant point ID
    embedding_model = Column(String(100), nullable=True)

    # Metadata
    token_count = Column(Integer, nullable=True)

    # Relationships
    document = relationship("Document", back_populates="chunks")

    # Constraints
    __table_args__ = (
        UniqueConstraint('document_id', 'chunk_index', name='uq_document_chunk_index'),
        Index('ix_document_chunks_vector_id', 'vector_id'),
    )
```

**Indexes**:
- `id` (PRIMARY KEY)
- `document_id` (for document's chunks)
- `vector_id` (for Qdrant lookups)
- `(document_id, chunk_index)` (UNIQUE, ensures no duplicate chunks)

**Chunking Strategy**:

```python
# Typical chunking parameters
CHUNK_SIZE = 512        # tokens per chunk
CHUNK_OVERLAP = 50      # token overlap between chunks

# Example chunks for a document
chunks = [
    DocumentChunk(document_id=1, chunk_index=0, content="...", token_count=512),
    DocumentChunk(document_id=1, chunk_index=1, content="...", token_count=512),  # 50 token overlap
    DocumentChunk(document_id=1, chunk_index=2, content="...", token_count=387),  # last chunk
]
```

**Qdrant Integration**:

```python
# After creating chunk, store embedding in Qdrant
from qdrant_client import QdrantClient

async def embed_and_store_chunk(chunk: DocumentChunk, session: AsyncSession):
    # 1. Generate embedding
    embedding = await openai.embeddings.create(
        model="text-embedding-3-small",
        input=chunk.content
    )
    vector = embedding.data[0].embedding  # 1536 dimensions

    # 2. Store in Qdrant
    qdrant = QdrantClient(url="http://localhost:6333")
    point_id = str(uuid.uuid4())

    qdrant.upsert(
        collection_name="documents",
        points=[{
            "id": point_id,
            "vector": vector,
            "payload": {
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "content": chunk.content,
                "token_count": chunk.token_count
            }
        }]
    )

    # 3. Update chunk with Qdrant ID
    chunk.vector_id = point_id
    chunk.embedding_model = "text-embedding-3-small"
    await session.commit()
```

**Common Queries**:

```python
# Get document chunks in order
async def get_document_chunks(document_id: int, session: AsyncSession):
    result = await session.execute(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index.asc())
    )
    return result.scalars().all()

# Reconstruct full document text
async def get_full_document_text(document_id: int, session: AsyncSession):
    chunks = await get_document_chunks(document_id, session)
    return "\n\n".join(chunk.content for chunk in chunks)
```

---

## Conversation & Messages

### Conversation Model

**Table**: `conversations`

**Purpose**: Tracks chat sessions with LLM, including model configuration and token usage.

```python
class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Conversation Metadata
    title = Column(String(500), nullable=True)  # Auto-generated or user-provided

    # Model Configuration
    model_name = Column(String(100), default="gpt-4", nullable=False)
    temperature = Column(Float, default=0.7, nullable=False)

    # Status
    status = Column(
        String(50),
        default="active",  # active, archived, deleted
        nullable=False,
        index=True
    )

    # Metrics
    message_count = Column(Integer, default=0, nullable=False)
    total_tokens_used = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
```

**Indexes**:
- `id` (PRIMARY KEY)
- `user_id` (for user's conversations)
- `status` (for active conversations)

**Sample Data**:

```python
conversation = Conversation(
    user_id=1,
    title="Component Design Discussion",
    model_name="gpt-4",
    temperature=0.7,
    status="active",
    message_count=15,
    total_tokens_used=8543
)
```

**Common Queries**:

```python
# Get user's active conversations
async def get_user_conversations(user_id: int, session: AsyncSession):
    result = await session.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .where(Conversation.status == "active")
        .order_by(Conversation.updated_at.desc())
    )
    return result.scalars().all()

# Update conversation metrics after message
async def update_conversation_metrics(conversation_id: int, tokens: int, session: AsyncSession):
    conversation = await session.get(Conversation, conversation_id)
    conversation.message_count += 1
    conversation.total_tokens_used += tokens
    await session.commit()
```

---

### Message Model

**Table**: `messages`

**Purpose**: Stores individual chat messages with threading support and context tracking.

```python
class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_message_id = Column(Integer, ForeignKey("messages.id", ondelete="SET NULL"), nullable=True, index=True)

    # Message Data
    role = Column(String(50), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)

    # Token Usage
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)

    # Context Tracking
    context_documents = Column(JSON, nullable=True)  # List of document IDs used for RAG

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    parent_message = relationship("Message", remote_side=[id], backref="replies")
```

**Indexes**:
- `id` (PRIMARY KEY)
- `conversation_id` (for conversation's messages)
- `parent_message_id` (for threaded replies)

**Message Threading**:

```
Message 1 (user): "How do I create a button?"
├─ Message 2 (assistant): "Here's how to create a button..."
└─ Message 3 (user): "Can you add hover effects?"
   └─ Message 4 (assistant): "Sure, here's the hover effect code..."
```

**Sample Data**:

```python
# User message
user_message = Message(
    conversation_id=1,
    parent_message_id=None,
    role="user",
    content="How do I create a primary button component?",
    prompt_tokens=None,
    completion_tokens=None,
    total_tokens=None,
    context_documents=None
)

# Assistant message with RAG context
assistant_message = Message(
    conversation_id=1,
    parent_message_id=user_message.id,
    role="assistant",
    content="Based on the design system, here's how to create a primary button...",
    prompt_tokens=1523,
    completion_tokens=847,
    total_tokens=2370,
    context_documents=[15, 28, 42]  # Document IDs used for context
)
```

**Common Queries**:

```python
# Get conversation messages in order
async def get_conversation_messages(conversation_id: int, session: AsyncSession):
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    return result.scalars().all()

# Get message with parent context
async def get_message_with_context(message_id: int, session: AsyncSession):
    result = await session.execute(
        select(Message)
        .options(joinedload(Message.parent_message))
        .where(Message.id == message_id)
    )
    return result.scalar_one_or_none()
```

---

## AI Model Tracking

### EmbeddingModel Model

**Table**: `embedding_models`

**Purpose**: Tracks embedding model configurations for versioning and compatibility.

```python
class EmbeddingModel(Base, TimestampMixin):
    __tablename__ = "embedding_models"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Model Metadata
    name = Column(String(100), unique=True, nullable=False)  # e.g., "text-embedding-3-small"
    provider = Column(String(50), nullable=False)            # e.g., "openai"
    dimension = Column(Integer, nullable=False)              # e.g., 1536
    max_tokens = Column(Integer, nullable=False)             # e.g., 8191

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
```

**Indexes**:
- `id` (PRIMARY KEY)
- `name` (UNIQUE)

**Sample Data**:

```python
embedding_models = [
    EmbeddingModel(
        name="text-embedding-3-small",
        provider="openai",
        dimension=1536,
        max_tokens=8191,
        is_active=True
    ),
    EmbeddingModel(
        name="text-embedding-3-large",
        provider="openai",
        dimension=3072,
        max_tokens=8191,
        is_active=False  # Not currently used
    ),
]
```

**Common Queries**:

```python
# Get active embedding model
async def get_active_embedding_model(session: AsyncSession):
    result = await session.execute(
        select(EmbeddingModel)
        .where(EmbeddingModel.is_active == True)
        .limit(1)
    )
    return result.scalar_one_or_none()
```

---

### EvaluationRun Model

**Table**: `evaluation_runs`

**Purpose**: Tracks AI model evaluation runs for quality metrics and performance monitoring.

```python
class EvaluationRun(Base, TimestampMixin):
    __tablename__ = "evaluation_runs"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Evaluation Metadata
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    # Configuration
    model_name = Column(String(100), nullable=False)
    dataset_name = Column(String(200), nullable=True)
    config = Column(JSON, nullable=True)  # Evaluation parameters

    # Status
    status = Column(
        String(50),
        default="pending",  # pending, running, completed, failed
        nullable=False,
        index=True
    )

    # Results
    metrics = Column(JSON, nullable=True)  # Accuracy, F1, precision, recall, etc.
```

**Indexes**:
- `id` (PRIMARY KEY)
- `status` (for active evaluations)

**Sample Data**:

```python
evaluation = EvaluationRun(
    name="Button Component Quality Test",
    description="Evaluate generated button components against design system",
    model_name="gpt-4",
    dataset_name="button_test_set_v1",
    config={
        "temperature": 0.7,
        "max_tokens": 2000,
        "test_cases": 50
    },
    status="completed",
    metrics={
        "accuracy": 0.94,
        "precision": 0.92,
        "recall": 0.96,
        "f1_score": 0.94,
        "avg_quality_score": 87.5,
        "avg_latency_ms": 3421
    }
)
```

---

## Epic 2 Workflow Tracking

### RequirementExport Model

**Table**: `requirement_exports`

**Purpose**: Tracks Epic 2 requirement extraction workflow with approval metrics and performance data.

```python
class RequirementExport(Base, TimestampMixin):
    __tablename__ = "requirement_exports"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Component Data
    component_type = Column(String(100), nullable=False, index=True)  # e.g., "Button", "Card"
    requirements = Column(JSON, nullable=False)  # Extracted requirements

    # Approval Workflow Metrics
    approved_count = Column(Integer, default=0, nullable=False)
    edited_count = Column(Integer, default=0, nullable=False)
    custom_added_count = Column(Integer, default=0, nullable=False)

    # Performance Metrics
    proposal_latency_ms = Column(Integer, nullable=True)  # Time to generate proposals

    # Integration Tracking
    used_in_pattern_retrieval = Column(Boolean, default=False, nullable=False)
    used_in_code_generation = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="requirement_exports")
```

**Indexes**:
- `id` (PRIMARY KEY)
- `user_id` (for user's exports)
- `component_type` (for component analysis)

**Workflow Steps**:

1. **Extraction**: Multi-agent system proposes requirements
2. **User Review**: User approves, edits, or adds custom requirements
3. **Tracking**: Metrics recorded (approved, edited, custom counts)
4. **Integration**: Used in Epic 3 (pattern retrieval) and Epic 4 (code generation)

**Sample Data**:

```python
requirement_export = RequirementExport(
    user_id=1,
    component_type="Button",
    requirements={
        "props": [
            {"name": "variant", "type": "string", "approved": True, "edited": False},
            {"name": "size", "type": "string", "approved": True, "edited": True},  # User edited
            {"name": "isLoading", "type": "boolean", "approved": False, "custom": True}  # User added
        ],
        "events": [
            {"name": "onClick", "type": "MouseEventHandler", "approved": True}
        ],
        "states": [
            {"name": "isHovered", "type": "boolean", "approved": True}
        ],
        "accessibility": [
            {"requirement": "ARIA label support", "approved": True}
        ]
    },
    approved_count=5,      # 5 proposals approved as-is
    edited_count=1,        # 1 proposal edited by user
    custom_added_count=1,  # 1 custom requirement added by user
    proposal_latency_ms=4523,  # 4.5 seconds to generate proposals
    used_in_pattern_retrieval=True,
    used_in_code_generation=True
)
```

**Common Queries**:

```python
# Get exports by component type
async def get_exports_by_component(component_type: str, session: AsyncSession):
    result = await session.execute(
        select(RequirementExport)
        .where(RequirementExport.component_type == component_type)
        .order_by(RequirementExport.created_at.desc())
    )
    return result.scalars().all()

# Calculate approval rate
async def get_approval_metrics(session: AsyncSession):
    result = await session.execute(
        select(
            func.avg(RequirementExport.approved_count).label("avg_approved"),
            func.avg(RequirementExport.edited_count).label("avg_edited"),
            func.avg(RequirementExport.custom_added_count).label("avg_custom")
        )
    )
    return result.one()

# Get high-performance exports (< 3s latency)
async def get_fast_exports(session: AsyncSession):
    result = await session.execute(
        select(RequirementExport)
        .where(RequirementExport.proposal_latency_ms < 3000)
        .order_by(RequirementExport.proposal_latency_ms.asc())
    )
    return result.scalars().all()
```

---

## Database Operations

### Session Management

```python
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db_session():
    """Dependency for FastAPI endpoints."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Usage in FastAPI endpoint
from fastapi import Depends

@app.get("/users/{user_id}")
async def get_user(
    user_id: int,
    session: AsyncSession = Depends(get_db_session)
):
    result = await session.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Transaction Patterns

```python
# Atomic transaction with multiple operations
async def create_conversation_with_message(
    user_id: int,
    message_content: str,
    session: AsyncSession
):
    # 1. Create conversation
    conversation = Conversation(
        user_id=user_id,
        title="New Conversation",
        model_name="gpt-4",
        temperature=0.7
    )
    session.add(conversation)
    await session.flush()  # Get conversation.id without committing

    # 2. Create first message
    message = Message(
        conversation_id=conversation.id,
        role="user",
        content=message_content
    )
    session.add(message)

    # 3. Update conversation metrics
    conversation.message_count = 1

    # 4. Commit all changes atomically
    await session.commit()
    await session.refresh(conversation)

    return conversation

# Rollback on error
async def safe_document_upload(document_data: dict, session: AsyncSession):
    try:
        # Create document record
        document = Document(**document_data)
        session.add(document)
        await session.commit()

        # Process file (may fail)
        await process_document_file(document.file_path)

        # Update status
        document.processing_status = "completed"
        await session.commit()

        return document
    except Exception as e:
        await session.rollback()  # Undo all changes
        raise
```

### Eager Loading

```python
from sqlalchemy.orm import selectinload, joinedload

# Load conversation with all messages (N+1 prevention)
async def get_conversation_with_messages(conversation_id: int, session: AsyncSession):
    result = await session.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))  # Eager load messages
        .where(Conversation.id == conversation_id)
    )
    return result.scalar_one_or_none()

# Load document with chunks and user
async def get_document_full(document_id: int, session: AsyncSession):
    result = await session.execute(
        select(Document)
        .options(
            selectinload(Document.chunks),  # Eager load chunks
            joinedload(Document.user)        # Eager load user
        )
        .where(Document.id == document_id)
    )
    return result.scalar_one_or_none()
```

---

## Performance Optimization

### Connection Pooling

```python
# Optimal pool settings for production
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,           # Core pool size (20 connections)
    max_overflow=10,        # Extra connections when pool is full
    pool_timeout=30,        # Wait 30s for connection before error
    pool_pre_ping=True,     # Verify connection health before use
    pool_recycle=3600,      # Recycle connections after 1 hour
    echo=False              # Disable SQL logging (performance)
)

# For high-traffic production:
# pool_size=50, max_overflow=20 (70 connections max)
```

### Indexing Strategy

**Critical Indexes** (already defined):
- Foreign key columns: `user_id`, `document_id`, `conversation_id`
- Lookup columns: `email`, `username`, `vector_id`, `processing_status`
- Unique constraints: `(document_id, chunk_index)`

**Additional Indexes for Large Scale**:

```python
# Add composite index for common query pattern
from alembic import op

def upgrade():
    # Index for "get user's completed documents ordered by date"
    op.create_index(
        'ix_documents_user_status_created',
        'documents',
        ['user_id', 'processing_status', 'created_at'],
        postgresql_using='btree'
    )

    # Index for "get conversation messages with token usage"
    op.create_index(
        'ix_messages_conversation_tokens',
        'messages',
        ['conversation_id', 'total_tokens'],
        postgresql_using='btree'
    )
```

### Query Optimization

```python
# BAD: N+1 query problem
conversations = await session.execute(select(Conversation).limit(10))
for conversation in conversations.scalars():
    messages = await session.execute(
        select(Message).where(Message.conversation_id == conversation.id)
    )  # This fires N additional queries!

# GOOD: Single query with eager loading
conversations = await session.execute(
    select(Conversation)
    .options(selectinload(Conversation.messages))
    .limit(10)
)  # Only 2 queries total (1 for conversations, 1 for all messages)

# BEST: Pagination with cursor
async def get_conversations_paginated(
    user_id: int,
    cursor_id: int | None,
    limit: int,
    session: AsyncSession
):
    query = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.id.desc())
        .limit(limit)
    )

    if cursor_id:
        query = query.where(Conversation.id < cursor_id)

    result = await session.execute(query)
    return result.scalars().all()
```

---

## Database Migrations

### Migration Setup (Alembic)

**Note**: Alembic migrations are not yet implemented but planned.

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
cd backend
alembic init alembic

# Configure alembic.ini
sqlalchemy.url = postgresql://user:pass@localhost:5432/componentforge

# Configure alembic/env.py to use async
from src.core.database import Base
from src.core.models import *  # Import all models

target_metadata = Base.metadata
```

### Creating Migrations

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add requirement_exports table"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Example Migration

```python
# alembic/versions/001_add_requirement_exports.py

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'requirement_exports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('component_type', sa.String(100), nullable=False),
        sa.Column('requirements', postgresql.JSON(), nullable=False),
        sa.Column('approved_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('edited_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('custom_added_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('proposal_latency_ms', sa.Integer(), nullable=True),
        sa.Column('used_in_pattern_retrieval', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('used_in_code_generation', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('ix_requirement_exports_user_id', 'requirement_exports', ['user_id'])
    op.create_index('ix_requirement_exports_component_type', 'requirement_exports', ['component_type'])

    op.create_foreign_key(
        'fk_requirement_exports_user_id',
        'requirement_exports', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    op.drop_table('requirement_exports')
```

---

## Backup and Recovery

### Backup Strategy

```bash
# Daily automated backup (production)
pg_dump -h localhost -U componentforge -F c -b -v -f backup_$(date +%Y%m%d).dump componentforge

# Backup with compression
pg_dump -h localhost -U componentforge -F c -Z 9 -f backup.dump.gz componentforge

# Backup specific tables
pg_dump -h localhost -U componentforge -t users -t conversations -F c -f user_data.dump componentforge
```

### Restore Strategy

```bash
# Restore full database
pg_restore -h localhost -U componentforge -d componentforge -v backup.dump

# Restore specific table
pg_restore -h localhost -U componentforge -d componentforge -t users -v backup.dump

# Restore to new database (for testing)
createdb componentforge_test
pg_restore -h localhost -U componentforge -d componentforge_test -v backup.dump
```

---

## Monitoring and Maintenance

### Database Health Checks

```python
from sqlalchemy import text

async def check_database_health(session: AsyncSession):
    """Check database connectivity and basic health."""
    try:
        # 1. Test connection
        await session.execute(text("SELECT 1"))

        # 2. Check table counts
        result = await session.execute(text("""
            SELECT
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        """))

        return {"status": "healthy", "tables": result.all()}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

### Common Maintenance Tasks

```sql
-- Vacuum and analyze (regular maintenance)
VACUUM ANALYZE users;
VACUUM ANALYZE documents;
VACUUM ANALYZE document_chunks;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check slow queries (requires pg_stat_statements extension)
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup,
    n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;
```

---

## Security Best Practices

### Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)

# Usage in user creation
async def create_user(email: str, password: str, session: AsyncSession):
    user = User(
        email=email,
        username=email.split('@')[0],
        hashed_password=hash_password(password)
    )
    session.add(user)
    await session.commit()
```

### SQL Injection Prevention

```python
# GOOD: Use parameterized queries (SQLAlchemy ORM)
async def get_user_by_email(email: str, session: AsyncSession):
    result = await session.execute(
        select(User).where(User.email == email)  # Parameterized automatically
    )
    return result.scalar_one_or_none()

# BAD: String interpolation (vulnerable to SQL injection)
# NEVER DO THIS:
async def get_user_bad(email: str, session: AsyncSession):
    query = f"SELECT * FROM users WHERE email = '{email}'"  # VULNERABLE!
    result = await session.execute(text(query))
```

### Row-Level Security

```sql
-- Enable RLS on users table (PostgreSQL 9.5+)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation_policy ON users
    FOR SELECT
    USING (id = current_setting('app.current_user_id')::integer);

-- Set user ID in session
SET app.current_user_id = 123;
```

---

## Troubleshooting

### Common Issues

**Issue**: `asyncpg.exceptions.TooManyConnectionsError`

```python
# Solution: Increase pool size or optimize connection usage
engine = create_async_engine(
    DATABASE_URL,
    pool_size=50,          # Increase from 20
    max_overflow=20,       # Increase from 10
    pool_timeout=60        # Increase timeout
)
```

**Issue**: Slow queries on large tables

```sql
-- Solution: Add appropriate indexes
CREATE INDEX ix_documents_user_status ON documents(user_id, processing_status);
CREATE INDEX ix_messages_conversation_created ON messages(conversation_id, created_at);

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM documents
WHERE user_id = 123 AND processing_status = 'completed';
```

**Issue**: Database connection timeouts

```python
# Solution: Enable pool_pre_ping
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,    # Verify connections before use
    pool_recycle=3600      # Recycle stale connections
)
```

---

## References

- **SQLAlchemy 2.0 Docs**: https://docs.sqlalchemy.org/en/20/
- **asyncpg**: https://magicstack.github.io/asyncpg/
- **PostgreSQL 16 Docs**: https://www.postgresql.org/docs/16/
- **Alembic**: https://alembic.sqlalchemy.org/
- **FastAPI Database Docs**: https://fastapi.tiangolo.com/tutorial/sql-databases/

## Related Documentation

- [Backend Architecture](./architecture.md) - Overall backend architecture
- [AI Pipeline](./ai-pipeline.md) - LangChain/LangGraph integration
- [Development Workflow](../development-workflow.md) - Local development guide
- [Deployment](../deployment.md) - Production deployment guide
