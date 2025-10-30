import os
import json
import hashlib
import sys
from pathlib import Path
from typing import List, Dict, Any

# Add src to Python path
backend_dir = Path(__file__).parent.parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

from core.models import Document, User
from scripts.base_seeder import BaseSeeder


class DocumentFixtureLoader(BaseSeeder):
    """Load sample documents from fixtures directory."""

    def __init__(self, session=None):
        super().__init__(session)
        self.fixtures_dir = backend_dir / "data" / "fixtures" / "documents"

    def seed(self) -> None:
        """Load sample documents into the database."""

        # Get a default user for document ownership
        admin_user = self.session.query(User).filter_by(email="admin@example.com").first()
        if not admin_user:
            self.logger.warning("Admin user not found. Documents will not have an owner.")

        documents_to_create = []

        # Process markdown documents
        for md_file in self.fixtures_dir.glob("*.md"):
            doc_data = self._process_markdown_file(md_file, admin_user)
            documents_to_create.append(doc_data)

        # Process any JSON document definitions
        json_files = list(self.fixtures_dir.glob("*.json"))
        for json_file in json_files:
            json_docs = self._process_json_file(json_file, admin_user)
            documents_to_create.extend(json_docs)

        # Create documents in database
        for doc_data in documents_to_create:
            document, created = self.get_or_create(
                Document,
                content_hash=doc_data["content_hash"],
                defaults=doc_data
            )

            if created:
                self.logger.info(f"Created document: {document.title}")
            else:
                self.logger.info(f"Document already exists: {document.title}")

    def _process_markdown_file(self, file_path: Path, owner: User = None) -> Dict[str, Any]:
        """Process a markdown file and extract metadata."""

        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract title from first header or filename
        title = self._extract_title_from_markdown(content, file_path.stem)

        # Calculate file hash
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()

        # Determine category from filename or content
        category = self._determine_category(file_path.name, content)

        # Extract tags from content
        tags = self._extract_tags_from_content(content)

        return {
            "title": title,
            "filename": file_path.name,
            "file_path": str(file_path),
            "content_type": "markdown",
            "file_size": len(content.encode('utf-8')),
            "content_hash": content_hash,
            "processing_status": "completed",
            "extracted_text": content,
            "word_count": len(content.split()),
            "language": "en",
            "chunk_count": 0,  # Will be updated when chunks are created
            "tags": tags,
            "category": category,
            "description": self._generate_description(content),
            "uploaded_by_id": owner.id if owner else None
        }

    def _process_json_file(self, file_path: Path, owner: User = None) -> List[Dict[str, Any]]:
        """Process a JSON file containing document definitions."""

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        documents = []

        # Handle different JSON structures
        if "documents" in data:
            # Array of documents
            for doc_def in data["documents"]:
                doc_data = self._create_doc_from_definition(doc_def, owner)
                documents.append(doc_data)
        elif isinstance(data, list):
            # Direct array of documents
            for doc_def in data:
                doc_data = self._create_doc_from_definition(doc_def, owner)
                documents.append(doc_data)
        else:
            # Single document
            doc_data = self._create_doc_from_definition(data, owner)
            documents.append(doc_data)

        return documents

    def _create_doc_from_definition(self, doc_def: Dict[str, Any], owner: User = None) -> Dict[str, Any]:
        """Create document data from JSON definition."""

        content = doc_def.get("content", "")
        content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()

        return {
            "title": doc_def.get("title", "Untitled Document"),
            "filename": doc_def.get("filename", "generated_document.txt"),
            "file_path": doc_def.get("file_path", "/fixtures/generated"),
            "content_type": doc_def.get("content_type", "text"),
            "file_size": len(content.encode('utf-8')),
            "content_hash": content_hash,
            "processing_status": doc_def.get("processing_status", "completed"),
            "extracted_text": content,
            "word_count": len(content.split()),
            "language": doc_def.get("language", "en"),
            "chunk_count": doc_def.get("chunk_count", 0),
            "tags": doc_def.get("tags", []),
            "category": doc_def.get("category", "general"),
            "description": doc_def.get("description", ""),
            "uploaded_by_id": owner.id if owner else None
        }

    def _extract_title_from_markdown(self, content: str, fallback: str) -> str:
        """Extract title from markdown content."""

        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('# '):
                return line[2:].strip()

        # Fallback to filename
        return fallback.replace('_', ' ').replace('-', ' ').title()

    def _determine_category(self, filename: str, content: str) -> str:
        """Determine document category based on filename and content."""

        filename_lower = filename.lower()

        # Category mappings
        if any(word in filename_lower for word in ['api', 'development', 'code', 'programming']):
            return "development"
        elif any(word in filename_lower for word in ['database', 'sql', 'query']):
            return "database"
        elif any(word in filename_lower for word in ['ai', 'ml', 'machine_learning', 'rag']):
            return "ai_ml"
        elif any(word in filename_lower for word in ['guide', 'tutorial', 'howto']):
            return "tutorial"
        elif any(word in filename_lower for word in ['async', 'python', 'pattern']):
            return "programming"
        else:
            return "general"

    def _extract_tags_from_content(self, content: str) -> List[str]:
        """Extract relevant tags from document content."""

        content_lower = content.lower()
        tags = []

        # Technology tags
        tech_keywords = {
            'python': 'Python',
            'fastapi': 'FastAPI',
            'async': 'Async',
            'database': 'Database',
            'postgresql': 'PostgreSQL',
            'vector': 'Vector Database',
            'embedding': 'Embeddings',
            'rag': 'RAG',
            'llm': 'LLM',
            'ai': 'AI',
            'machine learning': 'ML',
            'langchain': 'LangChain',
            'openai': 'OpenAI',
            'qdrant': 'Qdrant',
            'sqlalchemy': 'SQLAlchemy'
        }

        for keyword, tag in tech_keywords.items():
            if keyword in content_lower:
                tags.append(tag)

        # Concept tags
        concept_keywords = {
            'best practices': 'Best Practices',
            'optimization': 'Performance',
            'security': 'Security',
            'testing': 'Testing',
            'deployment': 'Deployment',
            'architecture': 'Architecture',
            'design pattern': 'Design Patterns'
        }

        for keyword, tag in concept_keywords.items():
            if keyword in content_lower:
                tags.append(tag)

        return list(set(tags))  # Remove duplicates

    def _generate_description(self, content: str) -> str:
        """Generate a brief description from content."""

        # Take first paragraph or first 200 characters
        lines = content.split('\n')

        # Skip title and find first substantial paragraph
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and len(line) > 50:
                # Truncate to reasonable length
                if len(line) > 200:
                    return line[:197] + "..."
                return line

        # Fallback to first 200 characters
        clean_content = content.replace('\n', ' ').replace('#', '').strip()
        if len(clean_content) > 200:
            return clean_content[:197] + "..."
        return clean_content


if __name__ == "__main__":
    # Run this loader directly
    loader = DocumentFixtureLoader()
    loader.run()