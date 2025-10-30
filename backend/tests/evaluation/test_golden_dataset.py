"""
Tests for golden dataset loader.

Validates:
- Dataset loading and validation
- Sample access by index and ID
- Statistics calculation
- Error handling for missing files
"""

import pytest
import json
from pathlib import Path
from unittest.mock import Mock, patch, mock_open
from src.evaluation.golden_dataset import GoldenDataset


class TestGoldenDataset:
    """Tests for GoldenDataset class."""

    def test_init_with_default_path(self):
        """Test initialization with default dataset path."""
        # This will fail if the dataset doesn't exist, which is expected in test env
        # In actual environment, the dataset should exist
        with pytest.raises(FileNotFoundError):
            dataset = GoldenDataset(dataset_path=Path("/nonexistent/path"))

    def test_init_validates_structure(self):
        """Test that initialization validates directory structure."""
        with pytest.raises(FileNotFoundError, match="Golden dataset not found"):
            GoldenDataset(dataset_path=Path("/nonexistent/path"))

    def test_len(self):
        """Test __len__ returns correct sample count."""
        # Use the actual golden dataset if it exists
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if dataset_path.exists():
            dataset = GoldenDataset(dataset_path=dataset_path)
            # Should have 15 samples based on Commit 2
            assert len(dataset) >= 5  # At least the initial 5 samples
        else:
            pytest.skip("Golden dataset not found")

    def test_getitem_valid_index(self):
        """Test __getitem__ with valid index."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)
        sample = dataset[0]

        # Verify sample structure
        assert 'id' in sample
        assert 'ground_truth' in sample
        assert 'image' in sample

        # Verify ground truth structure
        gt = sample['ground_truth']
        assert 'screenshot_id' in gt
        assert 'component_name' in gt
        assert 'expected_tokens' in gt
        assert 'expected_pattern_id' in gt
        assert 'expected_code_properties' in gt

    def test_getitem_invalid_index(self):
        """Test __getitem__ with invalid index raises IndexError."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)

        with pytest.raises(IndexError):
            _ = dataset[999]

        with pytest.raises(IndexError):
            _ = dataset[-999]

    def test_iter(self):
        """Test iteration over dataset."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)
        samples = list(dataset)

        assert len(samples) == len(dataset)
        for sample in samples:
            assert 'id' in sample
            assert 'ground_truth' in sample
            assert 'image' in sample

    def test_get_by_id_valid(self):
        """Test get_by_id with valid screenshot ID."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)

        # Get first sample to know a valid ID
        first_sample = dataset[0]
        screenshot_id = first_sample['id']

        # Retrieve by ID
        sample = dataset.get_by_id(screenshot_id)
        assert sample['id'] == screenshot_id

    def test_get_by_id_invalid(self):
        """Test get_by_id with invalid screenshot ID raises ValueError."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)

        with pytest.raises(ValueError, match="Screenshot ID not found"):
            dataset.get_by_id("nonexistent_id")

    def test_get_statistics(self):
        """Test get_statistics returns correct structure."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)
        stats = dataset.get_statistics()

        # Verify statistics structure
        assert 'total_samples' in stats
        assert 'samples_with_screenshots' in stats
        assert 'component_types' in stats
        assert 'avg_tokens_per_sample' in stats

        # Verify counts
        assert stats['total_samples'] >= 5  # At least initial 5 samples
        assert isinstance(stats['component_types'], dict)
        assert stats['avg_tokens_per_sample'] >= 0

    def test_component_type_distribution(self):
        """Test that dataset contains expected component types."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)
        stats = dataset.get_statistics()

        component_types = stats['component_types']

        # Should have button samples (from Commits 1 & 2)
        assert 'button' in component_types
        # Should have multiple variants
        assert component_types['button'] >= 2

    def test_ground_truth_format(self):
        """Test that ground truth follows expected format."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)
        sample = dataset[0]
        gt = sample['ground_truth']

        # Verify expected_tokens structure
        assert 'expected_tokens' in gt
        tokens = gt['expected_tokens']

        # Should have at least one token category
        assert len(tokens) > 0

        # Common categories
        possible_categories = ['colors', 'spacing', 'typography', 'border']
        assert any(cat in tokens for cat in possible_categories)

        # Verify expected_code_properties
        assert 'expected_code_properties' in gt
        props = gt['expected_code_properties']
        assert 'compiles' in props
        assert props['compiles'] is True  # All expected code must compile

    def test_sample_consistency(self):
        """Test that screenshot_id in JSON matches filename."""
        backend_dir = Path(__file__).parent.parent.parent
        dataset_path = backend_dir / "data" / "golden_dataset"

        if not dataset_path.exists():
            pytest.skip("Golden dataset not found")

        dataset = GoldenDataset(dataset_path=dataset_path)

        for sample in dataset:
            # screenshot_id in JSON should match the sample ID
            assert sample['id'] == sample['ground_truth']['screenshot_id']
