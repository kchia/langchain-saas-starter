"""
Database helper functions for Jupyter notebooks.

These functions simplify common database operations in notebooks,
providing easy access to data with proper async handling.
"""

import asyncio
import pandas as pd
from typing import List, Dict, Any, Optional
from sqlalchemy import text
from sqlalchemy.orm import selectinload

import sys
from pathlib import Path

# Add backend/src to Python path
project_root = Path(__file__).parent.parent.parent
backend_src = project_root / 'backend' / 'src'
sys.path.insert(0, str(backend_src))

from core.database import AsyncSessionLocal
from core.models import User, Document, Conversation, Message, EmbeddingModel


async def get_database_stats() -> Dict[str, int]:
    """Get basic database statistics."""
    async with AsyncSessionLocal() as session:
        stats = {}

        # Count records in each table
        tables = [
            ('users', User),
            ('documents', Document),
            ('conversations', Conversation),
            ('messages', Message),
            ('embedding_models', EmbeddingModel)
        ]

        for table_name, model in tables:
            result = await session.execute(f"SELECT COUNT(*) FROM {table_name}")
            stats[table_name] = result.scalar()

        return stats


async def get_users_df() -> pd.DataFrame:
    """Get users as a pandas DataFrame."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            "SELECT id, email, username, full_name, is_active, is_admin, "
            "login_count, last_login_at, created_at FROM users"
        )

        columns = ['id', 'email', 'username', 'full_name', 'is_active',
                  'is_admin', 'login_count', 'last_login_at', 'created_at']

        data = result.fetchall()
        return pd.DataFrame(data, columns=columns)


async def get_documents_df() -> pd.DataFrame:
    """Get documents as a pandas DataFrame."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            "SELECT id, title, filename, content_type, file_size, "
            "processing_status, word_count, language, category, "
            "chunk_count, created_at FROM documents"
        )

        columns = ['id', 'title', 'filename', 'content_type', 'file_size',
                  'processing_status', 'word_count', 'language', 'category',
                  'chunk_count', 'created_at']

        data = result.fetchall()
        return pd.DataFrame(data, columns=columns)


async def get_conversations_df() -> pd.DataFrame:
    """Get conversations as a pandas DataFrame."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            "SELECT c.id, c.user_id, u.username, c.title, c.model_name, "
            "c.temperature, c.status, c.message_count, c.total_tokens_used, "
            "c.last_message_at, c.created_at "
            "FROM conversations c "
            "JOIN users u ON c.user_id = u.id"
        )

        columns = ['id', 'user_id', 'username', 'title', 'model_name',
                  'temperature', 'status', 'message_count', 'total_tokens_used',
                  'last_message_at', 'created_at']

        data = result.fetchall()
        return pd.DataFrame(data, columns=columns)


async def get_messages_df(conversation_id: Optional[int] = None) -> pd.DataFrame:
    """Get messages as a pandas DataFrame."""
    async with AsyncSessionLocal() as session:
        query = (
            "SELECT m.id, m.conversation_id, m.role, m.message_index, "
            "m.prompt_tokens, m.completion_tokens, m.total_tokens, "
            "m.response_time_ms, m.created_at, "
            "LENGTH(m.content) as content_length "
            "FROM messages m"
        )

        if conversation_id:
            query += f" WHERE m.conversation_id = {conversation_id}"

        query += " ORDER BY m.conversation_id, m.message_index"

        result = await session.execute(query)

        columns = ['id', 'conversation_id', 'role', 'message_index',
                  'prompt_tokens', 'completion_tokens', 'total_tokens',
                  'response_time_ms', 'created_at', 'content_length']

        data = result.fetchall()
        return pd.DataFrame(data, columns=columns)


async def get_conversation_with_messages(conversation_id: int) -> Dict[str, Any]:
    """Get a full conversation with all messages."""
    async with AsyncSessionLocal() as session:
        # Get conversation
        conv_result = await session.execute(
            "SELECT c.*, u.username FROM conversations c "
            "JOIN users u ON c.user_id = u.id "
            "WHERE c.id = :conv_id",
            {"conv_id": conversation_id}
        )
        conversation = conv_result.fetchone()

        if not conversation:
            return None

        # Get messages
        msg_result = await session.execute(
            "SELECT * FROM messages WHERE conversation_id = :conv_id "
            "ORDER BY message_index",
            {"conv_id": conversation_id}
        )
        messages = msg_result.fetchall()

        return {
            "conversation": dict(conversation._mapping),
            "messages": [dict(msg._mapping) for msg in messages]
        }


async def execute_query(query: str, params: Optional[Dict] = None) -> pd.DataFrame:
    """Execute a custom SQL query and return as DataFrame."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(text(query), params or {})

        # Get column names
        columns = list(result.keys())

        # Get data
        data = result.fetchall()

        return pd.DataFrame(data, columns=columns)


async def get_token_usage_stats() -> Dict[str, Any]:
    """Get token usage statistics."""
    async with AsyncSessionLocal() as session:
        # Total tokens by model
        result = await session.execute(
            "SELECT model_name, SUM(total_tokens) as total_tokens, "
            "COUNT(*) as message_count, AVG(total_tokens) as avg_tokens "
            "FROM messages WHERE role = 'assistant' AND total_tokens IS NOT NULL "
            "GROUP BY model_name"
        )

        model_stats = {}
        for row in result:
            model_stats[row.model_name] = {
                'total_tokens': row.total_tokens,
                'message_count': row.message_count,
                'avg_tokens': float(row.avg_tokens)
            }

        # Daily usage
        daily_result = await session.execute(
            "SELECT DATE(created_at) as date, SUM(total_tokens) as daily_tokens "
            "FROM messages WHERE role = 'assistant' AND total_tokens IS NOT NULL "
            "GROUP BY DATE(created_at) ORDER BY date"
        )

        daily_stats = []
        for row in daily_result:
            daily_stats.append({
                'date': row.date,
                'tokens': row.daily_tokens
            })

        return {
            'by_model': model_stats,
            'by_date': daily_stats
        }


async def get_user_activity_stats() -> pd.DataFrame:
    """Get user activity statistics."""
    query = """
    SELECT
        u.username,
        u.email,
        COUNT(DISTINCT c.id) as conversation_count,
        COUNT(m.id) as message_count,
        SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_messages,
        SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END) as assistant_messages,
        SUM(m.total_tokens) as total_tokens,
        MAX(m.created_at) as last_activity,
        u.created_at as user_created_at
    FROM users u
    LEFT JOIN conversations c ON u.id = c.user_id
    LEFT JOIN messages m ON c.id = m.conversation_id
    GROUP BY u.id, u.username, u.email, u.created_at
    ORDER BY conversation_count DESC
    """

    return await execute_query(query)


# Sync wrapper functions for easier use in notebooks
def sync_get_database_stats():
    """Sync wrapper for get_database_stats."""
    return asyncio.run(get_database_stats())

def sync_get_users_df():
    """Sync wrapper for get_users_df."""
    return asyncio.run(get_users_df())

def sync_get_documents_df():
    """Sync wrapper for get_documents_df."""
    return asyncio.run(get_documents_df())

def sync_get_conversations_df():
    """Sync wrapper for get_conversations_df."""
    return asyncio.run(get_conversations_df())

def sync_get_messages_df(conversation_id=None):
    """Sync wrapper for get_messages_df."""
    return asyncio.run(get_messages_df(conversation_id))

def sync_execute_query(query, params=None):
    """Sync wrapper for execute_query."""
    return asyncio.run(execute_query(query, params))