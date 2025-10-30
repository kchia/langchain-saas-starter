from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer,
    String, Text, JSON, Index, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func

Base = declarative_base()


class TimestampMixin:
    """Mixin for adding timestamp fields to models."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class User(Base, TimestampMixin):
    """User model for authentication and session management."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))

    # Authentication fields
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Profile fields
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    preferences: Mapped[Optional[dict]] = mapped_column(JSON)

    # Activity tracking
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    login_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan"
    )
    documents: Mapped[List["Document"]] = relationship(
        "Document", back_populates="uploaded_by"
    )


class Document(Base, TimestampMixin):
    """Document model for RAG system."""

    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)

    # Content metadata
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)  # pdf, txt, md, etc.
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)  # bytes
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # SHA-256

    # Processing status
    processing_status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False,
        index=True
    )  # pending, processing, completed, failed

    # Content extraction
    extracted_text: Mapped[Optional[str]] = mapped_column(Text)
    page_count: Mapped[Optional[int]] = mapped_column(Integer)
    word_count: Mapped[Optional[int]] = mapped_column(Integer)
    language: Mapped[Optional[str]] = mapped_column(String(10))

    # Vector embeddings metadata
    embedding_model: Mapped[Optional[str]] = mapped_column(String(100))
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Organization
    tags: Mapped[Optional[List[str]]] = mapped_column(JSON)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    uploaded_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), index=True
    )
    uploaded_by: Mapped[Optional["User"]] = relationship("User", back_populates="documents")

    chunks: Mapped[List["DocumentChunk"]] = relationship(
        "DocumentChunk", back_populates="document", cascade="all, delete-orphan"
    )

    # Indexes
    __table_args__ = (
        Index("idx_document_status_created", "processing_status", "created_at"),
        Index("idx_document_content_type", "content_type"),
    )


class DocumentChunk(Base, TimestampMixin):
    """Document chunks for vector storage and retrieval."""

    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("documents.id"), nullable=False, index=True
    )

    # Chunk metadata
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    # Position in document
    start_page: Mapped[Optional[int]] = mapped_column(Integer)
    end_page: Mapped[Optional[int]] = mapped_column(Integer)
    start_char: Mapped[Optional[int]] = mapped_column(Integer)
    end_char: Mapped[Optional[int]] = mapped_column(Integer)

    # Vector embedding metadata
    vector_id: Mapped[Optional[str]] = mapped_column(String(100), index=True)  # Qdrant point ID
    embedding_model: Mapped[str] = mapped_column(String(100), nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="chunks")

    # Constraints
    __table_args__ = (
        UniqueConstraint("document_id", "chunk_index", name="uq_document_chunk"),
        Index("idx_chunk_vector", "vector_id"),
        Index("idx_chunk_document", "document_id", "chunk_index"),
    )


class Conversation(Base, TimestampMixin):
    """Conversation/Chat session model."""

    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )

    # Conversation metadata
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Configuration
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    system_prompt: Mapped[Optional[str]] = mapped_column(Text)
    temperature: Mapped[float] = mapped_column(Float, default=0.7, nullable=False)
    max_tokens: Mapped[Optional[int]] = mapped_column(Integer)

    # Status and metrics
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False,
        index=True
    )  # active, archived, deleted

    message_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Timestamps
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conversations")
    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan",
        order_by="Message.created_at"
    )

    # Indexes
    __table_args__ = (
        Index("idx_conversation_user_status", "user_id", "status"),
        Index("idx_conversation_last_message", "last_message_at"),
    )


class Message(Base, TimestampMixin):
    """Individual messages within conversations."""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    conversation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("conversations.id"), nullable=False, index=True
    )

    # Message content
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Metadata
    message_index: Mapped[int] = mapped_column(Integer, nullable=False)
    parent_message_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("messages.id"), index=True
    )

    # AI response metadata (for assistant messages)
    model_name: Mapped[Optional[str]] = mapped_column(String(100))
    prompt_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    completion_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    total_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer)

    # RAG context (if applicable)
    context_documents: Mapped[Optional[List[dict]]] = mapped_column(JSON)
    retrieval_query: Mapped[Optional[str]] = mapped_column(Text)

    # Feedback and rating
    rating: Mapped[Optional[int]] = mapped_column(Integer)  # 1-5 stars
    feedback: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")
    parent_message: Mapped[Optional["Message"]] = relationship(
        "Message", remote_side=[id], backref="child_messages"
    )

    # Constraints
    __table_args__ = (
        UniqueConstraint("conversation_id", "message_index", name="uq_conversation_message"),
        Index("idx_message_conversation_role", "conversation_id", "role"),
        Index("idx_message_created", "created_at"),
    )


class EmbeddingModel(Base, TimestampMixin):
    """Track embedding models and their configurations."""

    __tablename__ = "embedding_models"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # openai, huggingface, etc.
    model_id: Mapped[str] = mapped_column(String(200), nullable=False)

    # Model specifications
    dimension: Mapped[int] = mapped_column(Integer, nullable=False)
    max_tokens: Mapped[int] = mapped_column(Integer, nullable=False)

    # Configuration
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Metadata
    description: Mapped[Optional[str]] = mapped_column(Text)
    configuration: Mapped[Optional[dict]] = mapped_column(JSON)


class EvaluationRun(Base, TimestampMixin):
    """Track AI model evaluation runs."""

    __tablename__ = "evaluation_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Configuration
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    dataset_name: Mapped[str] = mapped_column(String(100), nullable=False)
    evaluation_type: Mapped[str] = mapped_column(String(50), nullable=False)  # rag, chat, qa, etc.

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default="running",
        nullable=False,
        index=True
    )  # running, completed, failed

    # Results
    total_questions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_questions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Metrics (RAGAS or custom metrics)
    metrics: Mapped[Optional[dict]] = mapped_column(JSON)

    # Timing
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Configuration used
    configuration: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Indexes
    __table_args__ = (
        Index("idx_evaluation_status_created", "status", "created_at"),
        Index("idx_evaluation_model_type", "model_name", "evaluation_type"),
    )


class RequirementExport(Base, TimestampMixin):
    """Store approved requirements with complete audit trail.

    This model tracks the complete lifecycle of requirement proposals
    from initial generation through approval and export, enabling
    audit compliance and workflow analytics.
    """

    __tablename__ = "requirement_exports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Export metadata
    export_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    # Component classification
    component_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    component_confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # Requirements data
    requirements: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    # Source data references
    source_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    source_metadata: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
    )

    # Design tokens context
    tokens: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
    )

    # Approval workflow tracking
    total_requirements: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    approved_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    edited_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    custom_added_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Performance metrics
    proposal_latency_ms: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    approval_duration_ms: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    # Timestamps
    proposed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    exported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Integration tracking
    used_in_pattern_retrieval: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    used_in_code_generation: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    pattern_retrieval_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    code_generation_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Quality metrics (for evaluation)
    precision_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    recall_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    user_edit_rate: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    # Status tracking
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="exported",
        index=True,
    )

    # Optional notes
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Indexes for common queries
    __table_args__ = (
        Index("idx_export_component_type", "component_type"),
        Index("idx_export_source_type", "source_type"),
        Index("idx_export_status_created", "status", "created_at"),
        Index("idx_export_proposed_at", "proposed_at"),
        Index("idx_export_exported_at", "exported_at"),
    )

    def calculate_user_edit_rate(self) -> float:
        """Calculate the percentage of requirements edited by the user.

        Returns:
            float: Edit rate as percentage (0.0-1.0)
        """
        if self.total_requirements == 0:
            return 0.0
        return self.edited_count / self.total_requirements

    def meets_latency_target(self, target_ms: int = 15000) -> bool:
        """Check if proposal latency meets target (default 15s).

        Args:
            target_ms: Target latency in milliseconds

        Returns:
            bool: True if latency meets target
        """
        if self.proposal_latency_ms is None:
            return False
        return self.proposal_latency_ms <= target_ms

    def get_approval_summary(self) -> dict:
        """Get summary statistics for this export.

        Returns:
            dict: Summary with approval rates and metrics
        """
        approval_rate = self.approved_count / self.total_requirements if self.total_requirements > 0 else 0.0
        edit_rate = self.calculate_user_edit_rate()

        return {
            "export_id": self.export_id,
            "component_type": self.component_type,
            "total_requirements": self.total_requirements,
            "approved_count": self.approved_count,
            "approval_rate": approval_rate,
            "edited_count": self.edited_count,
            "edit_rate": edit_rate,
            "custom_added_count": self.custom_added_count,
            "proposal_latency_ms": self.proposal_latency_ms,
            "meets_latency_target": self.meets_latency_target(),
            "proposed_at": self.proposed_at.isoformat() if self.proposed_at else None,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "exported_at": self.exported_at.isoformat() if self.exported_at else None,
        }