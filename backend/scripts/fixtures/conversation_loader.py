import json
import sys
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime, timedelta

# Add src to Python path
backend_dir = Path(__file__).parent.parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from core.models import Conversation, Message, User
from scripts.base_seeder import BaseSeeder


class ConversationFixtureLoader(BaseSeeder):
    """Load sample conversations from fixtures directory."""

    def __init__(self, session=None):
        super().__init__(session)
        self.fixtures_dir = backend_dir / "data" / "fixtures" / "conversations"

    def seed(self) -> None:
        """Load sample conversations into the database."""

        # Process all JSON files in conversations directory
        json_files = list(self.fixtures_dir.glob("*.json"))

        for json_file in json_files:
            self._process_conversation_file(json_file)

    def _process_conversation_file(self, file_path: Path) -> None:
        """Process a JSON file containing conversations."""

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        conversations = data.get("conversations", [])

        for conv_data in conversations:
            self._create_conversation_with_messages(conv_data)

    def _create_conversation_with_messages(self, conv_data: Dict[str, Any]) -> None:
        """Create a conversation and its messages."""

        # Find the user for this conversation
        user_email = conv_data.get("user_email", "admin@example.com")
        user = self.session.query(User).filter_by(email=user_email).first()

        if not user:
            self.logger.warning(f"User {user_email} not found. Skipping conversation.")
            return

        # Create conversation
        conversation_data = {
            "user_id": user.id,
            "title": conv_data["title"],
            "description": conv_data.get("description", ""),
            "model_name": conv_data.get("model_name", "gpt-4"),
            "system_prompt": conv_data.get("system_prompt", ""),
            "temperature": conv_data.get("temperature", 0.7),
            "status": "active",
            "message_count": len(conv_data.get("messages", [])),
            "total_tokens_used": self._calculate_total_tokens(conv_data.get("messages", [])),
            "last_message_at": datetime.utcnow() - timedelta(hours=1)  # Recent activity
        }

        # Check if conversation already exists (by title and user)
        existing_conv = self.session.query(Conversation).filter_by(
            user_id=user.id,
            title=conv_data["title"]
        ).first()

        if existing_conv:
            self.logger.info(f"Conversation already exists: {conv_data['title']}")
            return

        conversation = Conversation(**conversation_data)
        self.session.add(conversation)
        self.session.flush()  # Get the ID

        self.logger.info(f"Created conversation: {conversation.title}")

        # Create messages
        messages_data = conv_data.get("messages", [])
        for index, msg_data in enumerate(messages_data):
            self._create_message(conversation.id, index, msg_data)

    def _create_message(self, conversation_id: int, index: int, msg_data: Dict[str, Any]) -> None:
        """Create a single message."""

        # Calculate creation time (spread messages over time)
        base_time = datetime.utcnow() - timedelta(hours=2)
        created_at = base_time + timedelta(minutes=index * 5)

        message_data = {
            "conversation_id": conversation_id,
            "role": msg_data["role"],
            "content": msg_data["content"],
            "message_index": index,
            "created_at": created_at
        }

        # Add AI response metadata for assistant messages
        if msg_data["role"] == "assistant":
            token_usage = msg_data.get("token_usage", {})
            message_data.update({
                "model_name": "gpt-4",
                "prompt_tokens": token_usage.get("prompt_tokens"),
                "completion_tokens": token_usage.get("completion_tokens"),
                "total_tokens": token_usage.get("total_tokens"),
                "response_time_ms": 1500 + (index * 200),  # Simulated response time
            })

            # Add context documents if available
            context_docs = msg_data.get("context_documents")
            if context_docs:
                message_data["context_documents"] = context_docs
                message_data["retrieval_query"] = self._extract_retrieval_query(msg_data["content"])

        message = Message(**message_data)
        self.session.add(message)

        self.logger.debug(f"Created message {index} for conversation {conversation_id}")

    def _calculate_total_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Calculate total tokens used in conversation."""

        total = 0
        for msg in messages:
            token_usage = msg.get("token_usage", {})
            total += token_usage.get("total_tokens", 0)

        return total

    def _extract_retrieval_query(self, content: str) -> str:
        """Extract or generate a retrieval query from assistant response."""

        # For demo purposes, extract first sentence or key terms
        sentences = content.split('. ')
        if sentences:
            first_sentence = sentences[0].strip()
            if len(first_sentence) > 100:
                return first_sentence[:97] + "..."
            return first_sentence

        return ""

    def _load_prompt_templates(self) -> Dict[str, str]:
        """Load system prompt templates from fixtures."""

        prompts_file = self.fixtures_dir.parent / "prompts" / "system_prompts.json"

        if not prompts_file.exists():
            return {}

        with open(prompts_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Create mapping of prompt names to system prompts
        prompt_map = {}
        for prompt in data.get("prompts", []):
            prompt_map[prompt["name"]] = prompt["system_prompt"]

        return prompt_map


class PromptFixtureLoader(BaseSeeder):
    """Load system prompt templates (for reference, not stored in DB yet)."""

    def __init__(self, session=None):
        super().__init__(session)
        self.fixtures_dir = backend_dir / "data" / "fixtures" / "prompts"

    def seed(self) -> None:
        """Log available prompt templates."""

        json_files = list(self.fixtures_dir.glob("*.json"))

        for json_file in json_files:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            prompts = data.get("prompts", [])
            self.logger.info(f"Loaded {len(prompts)} prompt templates from {json_file.name}")

            for prompt in prompts:
                self.logger.debug(f"  - {prompt['name']}: {prompt['title']}")


if __name__ == "__main__":
    # Run this loader directly
    loader = ConversationFixtureLoader()
    loader.run()