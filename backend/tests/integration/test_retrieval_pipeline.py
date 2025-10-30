"""
Integration Tests for Pattern Retrieval Pipeline (Epic 3 - T5)

Tests the complete retrieval flow from requirements to pattern matching.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient

from src.main import app

# API endpoint constants
RETRIEVAL_ENDPOINT = "/api/v1/retrieval/search"


class TestRetrievalPipelineIntegration:
    """Integration tests for the complete retrieval pipeline."""

    @pytest.fixture
    def client(self):
        """Create FastAPI test client."""
        return TestClient(app)

    @pytest.fixture
    def sample_requirements(self):
        """Sample requirements from Epic 2."""
        return {
            "requirements": {
                "component_type": "Button",
                "props": ["variant", "size", "disabled"],
                "variants": ["primary", "secondary", "ghost"],
                "a11y": ["aria-label", "keyboard navigation"]
            }
        }

    @pytest.fixture
    def mock_retrieval_service(self):
        """Mock retrieval service with realistic response."""
        service = Mock()
        service.patterns = [
            {
                "id": "shadcn-button",
                "name": "Button",
                "category": "form",
                "description": "Accessible button with variants",
            },
            {
                "id": "shadcn-card",
                "name": "Card",
                "category": "layout",
                "description": "Card container component",
            }
        ]
        
        # Mock async search method
        async def mock_search(requirements, top_k=3):
            return {
                "patterns": [
                    {
                        "id": "shadcn-button",
                        "name": "Button",
                        "category": "form",
                        "description": "A customizable button component with multiple variants",
                        "framework": "React",
                        "library": "shadcn/ui",
                        "code": "export const Button = () => { /* ... */ }",
                        "metadata": {
                            "props": [
                                {"name": "variant", "type": "string"},
                                {"name": "size", "type": "string"}
                            ],
                            "variants": [
                                {"name": "primary"},
                                {"name": "secondary"},
                                {"name": "ghost"}
                            ],
                            "a11y": ["aria-label", "role"]
                        },
                        "confidence": 0.92,
                        "explanation": "Matches button type with variant prop and multiple variants",
                        "match_highlights": {
                            "matched_props": ["variant", "size"],
                            "matched_variants": ["primary", "secondary", "ghost"],
                            "matched_a11y": ["aria-label"]
                        },
                        "ranking_details": {
                            "bm25_score": 15.4,
                            "bm25_rank": 1,
                            "semantic_score": 0.89,
                            "semantic_rank": 1,
                            "final_score": 0.92,
                            "final_rank": 1
                        }
                    },
                    {
                        "id": "radix-button",
                        "name": "Button",
                        "category": "form",
                        "description": "Radix UI button primitive",
                        "framework": "React",
                        "library": "Radix UI",
                        "code": "export const Button = () => { /* ... */ }",
                        "metadata": {
                            "props": [
                                {"name": "asChild", "type": "boolean"}
                            ],
                            "variants": [],
                            "a11y": ["role", "aria-pressed"]
                        },
                        "confidence": 0.68,
                        "explanation": "Button component but different prop structure",
                        "match_highlights": {
                            "matched_props": [],
                            "matched_variants": [],
                            "matched_a11y": []
                        },
                        "ranking_details": {
                            "bm25_score": 8.2,
                            "bm25_rank": 2,
                            "semantic_score": 0.65,
                            "semantic_rank": 3,
                            "final_score": 0.68,
                            "final_rank": 2
                        }
                    },
                    {
                        "id": "headlessui-button",
                        "name": "Button",
                        "category": "form",
                        "description": "HeadlessUI button component",
                        "framework": "React",
                        "library": "HeadlessUI",
                        "code": "export const Button = () => { /* ... */ }",
                        "metadata": {
                            "props": [
                                {"name": "as", "type": "string"}
                            ],
                            "variants": [],
                            "a11y": ["aria-label"]
                        },
                        "confidence": 0.58,
                        "explanation": "Basic button component",
                        "match_highlights": {
                            "matched_props": [],
                            "matched_variants": [],
                            "matched_a11y": ["aria-label"]
                        },
                        "ranking_details": {
                            "bm25_score": 6.1,
                            "bm25_rank": 3,
                            "semantic_score": 0.54,
                            "semantic_rank": 4,
                            "final_score": 0.58,
                            "final_rank": 3
                        }
                    }
                ],
                "retrieval_metadata": {
                    "latency_ms": 450,
                    "methods_used": ["bm25", "semantic"],
                    "weights": {
                        "bm25": 0.3,
                        "semantic": 0.7
                    },
                    "total_patterns_searched": 10,
                    "query": "Button component with variant, size and disabled props"
                }
            }
        
        service.search = AsyncMock(side_effect=mock_search)
        return service

    def test_retrieval_pipeline_e2e(self, client, sample_requirements, mock_retrieval_service):
        """
        Test complete retrieval pipeline end-to-end.
        
        Flow:
        1. Receive requirements from Epic 2
        2. Call retrieval API
        3. Get top-3 patterns with metadata
        4. Validate response structure and data
        """
        # Mock the retrieval service in app state
        with patch.object(app.state, 'retrieval_service', mock_retrieval_service):
            # Make request to retrieval endpoint
            response = client.post(RETRIEVAL_ENDPOINT, json=sample_requirements)
            
            # Assert successful response
            assert response.status_code == 200
            data = response.json()
            
            # Validate response structure
            assert "patterns" in data
            assert "retrieval_metadata" in data
            
            # Validate patterns
            patterns = data["patterns"]
            assert len(patterns) <= 3  # Top-3 results
            assert len(patterns) > 0  # At least one result
            
            # Validate first pattern (best match)
            top_pattern = patterns[0]
            assert top_pattern["id"] == "shadcn-button"
            assert top_pattern["name"] == "Button"
            assert top_pattern["confidence"] >= 0.7  # High confidence
            assert "explanation" in top_pattern
            assert "match_highlights" in top_pattern
            assert "ranking_details" in top_pattern
            
            # Validate match highlights
            highlights = top_pattern["match_highlights"]
            assert "matched_props" in highlights
            assert "matched_variants" in highlights
            assert "matched_a11y" in highlights
            assert "variant" in highlights["matched_props"]
            assert "primary" in highlights["matched_variants"]
            
            # Validate ranking details
            ranking = top_pattern["ranking_details"]
            assert "bm25_score" in ranking
            assert "semantic_score" in ranking
            assert "final_score" in ranking
            assert ranking["bm25_rank"] > 0
            assert ranking["final_rank"] == 1  # Best match should be rank 1
            
            # Validate retrieval metadata
            metadata = data["retrieval_metadata"]
            assert metadata["latency_ms"] < 1000  # <1s target
            assert "bm25" in metadata["methods_used"]
            assert "semantic" in metadata["methods_used"]
            assert metadata["total_patterns_searched"] > 0
            assert metadata["weights"]["bm25"] == 0.3
            assert metadata["weights"]["semantic"] == 0.7

    def test_retrieval_pipeline_validation_error(self, client):
        """Test that missing component_type returns validation error."""
        invalid_requirements = {
            "requirements": {
                # Missing component_type
                "props": ["variant"],
                "variants": ["primary"]
            }
        }
        
        with patch.object(app.state, 'retrieval_service', Mock()):
            response = client.post(RETRIEVAL_ENDPOINT, json=invalid_requirements)
            
            # Should return 400 Bad Request
            assert response.status_code == 400
            data = response.json()
            assert "detail" in data
            assert "component_type" in data["detail"].lower()

    def test_retrieval_pipeline_service_unavailable(self, client, sample_requirements):
        """Test error when retrieval service is not initialized."""
        # Don't mock the service - it won't exist
        response = client.post(RETRIEVAL_ENDPOINT, json=sample_requirements)
        
        # Should return 503 Service Unavailable
        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
        assert "not initialized" in data["detail"].lower()

    def test_retrieval_latency_target(self, client, sample_requirements, mock_retrieval_service):
        """Test that retrieval meets <1s latency target."""
        with patch.object(app.state, 'retrieval_service', mock_retrieval_service):
            response = client.post(RETRIEVAL_ENDPOINT, json=sample_requirements)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify latency is under 1 second
            latency = data["retrieval_metadata"]["latency_ms"]
            assert latency < 1000, f"Latency {latency}ms exceeds 1000ms target"

    def test_retrieval_top_k_limit(self, client, sample_requirements, mock_retrieval_service):
        """Test that retrieval returns at most top-3 patterns."""
        with patch.object(app.state, 'retrieval_service', mock_retrieval_service):
            response = client.post(RETRIEVAL_ENDPOINT, json=sample_requirements)
            
            assert response.status_code == 200
            data = response.json()
            
            # Should return at most 3 patterns
            assert len(data["patterns"]) <= 3

    def test_retrieval_confidence_scores(self, client, sample_requirements, mock_retrieval_service):
        """Test that all patterns have valid confidence scores."""
        with patch.object(app.state, 'retrieval_service', mock_retrieval_service):
            response = client.post(RETRIEVAL_ENDPOINT, json=sample_requirements)
            
            assert response.status_code == 200
            data = response.json()
            
            # Validate confidence scores
            for pattern in data["patterns"]:
                confidence = pattern["confidence"]
                assert 0.0 <= confidence <= 1.0, f"Invalid confidence: {confidence}"
                assert "explanation" in pattern
                assert len(pattern["explanation"]) > 0

    def test_retrieval_patterns_ranked_by_confidence(self, client, sample_requirements, mock_retrieval_service):
        """Test that patterns are ranked by descending confidence."""
        with patch.object(app.state, 'retrieval_service', mock_retrieval_service):
            response = client.post(RETRIEVAL_ENDPOINT, json=sample_requirements)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify patterns are sorted by confidence (descending)
            confidences = [p["confidence"] for p in data["patterns"]]
            assert confidences == sorted(confidences, reverse=True)
            
            # Verify ranking details match
            for i, pattern in enumerate(data["patterns"], start=1):
                assert pattern["ranking_details"]["final_rank"] == i

    def test_retrieval_includes_code_and_metadata(self, client, sample_requirements, mock_retrieval_service):
        """Test that patterns include code and comprehensive metadata."""
        with patch.object(app.state, 'retrieval_service', mock_retrieval_service):
            response = client.post(RETRIEVAL_ENDPOINT, json=sample_requirements)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify all patterns have code and metadata
            for pattern in data["patterns"]:
                assert "code" in pattern
                assert len(pattern["code"]) > 0
                
                assert "metadata" in pattern
                metadata = pattern["metadata"]
                assert "props" in metadata
                assert "variants" in metadata
                assert "a11y" in metadata

    def test_epic_2_to_epic_3_data_flow(self, client, mock_retrieval_service):
        """
        Test Epic 2 → Epic 3 data flow.
        
        Simulates:
        1. Epic 2 generates requirements
        2. Requirements passed to Epic 3
        3. Epic 3 retrieves matching patterns
        """
        # Epic 2 requirements (output)
        epic_2_requirements = {
            "component_type": "Card",
            "props": ["padding", "shadow"],
            "variants": ["elevated", "outlined"],
            "a11y": ["role"]
        }
        
        # Transform to retrieval request format
        retrieval_request = {
            "requirements": epic_2_requirements
        }
        
        # Mock search to return Card pattern
        async def mock_card_search(requirements, top_k=3):
            return {
                "patterns": [
                    {
                        "id": "shadcn-card",
                        "name": "Card",
                        "category": "layout",
                        "description": "Card container",
                        "framework": "React",
                        "library": "shadcn/ui",
                        "code": "export const Card = () => {}",
                        "metadata": {
                            "props": [{"name": "padding"}],
                            "variants": [{"name": "elevated"}],
                            "a11y": ["role"]
                        },
                        "confidence": 0.88,
                        "explanation": "Matches card with variants",
                        "match_highlights": {
                            "matched_props": ["padding"],
                            "matched_variants": ["elevated"],
                            "matched_a11y": ["role"]
                        },
                        "ranking_details": {
                            "bm25_score": 12.0,
                            "bm25_rank": 1,
                            "semantic_score": 0.85,
                            "semantic_rank": 1,
                            "final_score": 0.88,
                            "final_rank": 1
                        }
                    }
                ],
                "retrieval_metadata": {
                    "latency_ms": 380,
                    "methods_used": ["bm25", "semantic"],
                    "weights": {"bm25": 0.3, "semantic": 0.7},
                    "total_patterns_searched": 10,
                    "query": "Card component with padding and shadow props"
                }
            }
        
        mock_retrieval_service.search = AsyncMock(side_effect=mock_card_search)
        
        with patch.object(app.state, 'retrieval_service', mock_retrieval_service):
            response = client.post(RETRIEVAL_ENDPOINT, json=retrieval_request)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify Epic 3 returns Card pattern
            assert len(data["patterns"]) > 0
            assert data["patterns"][0]["id"] == "shadcn-card"
            assert data["patterns"][0]["name"] == "Card"
            
            # Verify Epic 3 output can be passed to Epic 4
            selected_pattern = data["patterns"][0]
            epic_4_input = {
                "pattern": {
                    "id": selected_pattern["id"],
                    "code": selected_pattern["code"],
                    "metadata": selected_pattern["metadata"]
                },
                "requirements": epic_2_requirements
            }
            
            # Validate Epic 4 input has all necessary data
            assert epic_4_input["pattern"]["id"] == "shadcn-card"
            assert "code" in epic_4_input["pattern"]
            assert "requirements" in epic_4_input
