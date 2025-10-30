"""
Golden dataset loader for E2E evaluation.

This module provides the GoldenDataset class for loading component screenshots
and their corresponding ground truth data for evaluation.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Iterator
from PIL import Image

from ..core.logging import get_logger

logger = get_logger(__name__)


class GoldenDataset:
    """
    Loader for golden dataset of component screenshots and ground truth.

    The golden dataset consists of:
    - Screenshots: Component images (PNG files)
    - Ground Truth: Expected tokens, pattern IDs, and code properties (JSON files)

    Directory structure:
        backend/data/golden_dataset/
        ├── screenshots/
        │   ├── button_primary.png
        │   └── ...
        └── ground_truth/
            ├── button_primary.json
            └── ...
    """

    def __init__(self, dataset_path: Path = None):
        """
        Initialize golden dataset loader.

        Args:
            dataset_path: Path to golden_dataset directory.
                         Defaults to backend/data/golden_dataset/
        """
        if dataset_path is None:
            # Default to backend/data/golden_dataset/
            backend_dir = Path(__file__).parent.parent.parent
            dataset_path = backend_dir / "data" / "golden_dataset"

        self.dataset_path = Path(dataset_path)
        self.screenshots_path = self.dataset_path / "screenshots"
        self.ground_truth_path = self.dataset_path / "ground_truth"

        self._validate_dataset()
        self._samples = self._load_samples()

        logger.info(f"Loaded golden dataset: {len(self._samples)} samples from {self.dataset_path}")

    def _validate_dataset(self):
        """
        Validate that dataset directory structure exists.

        Raises:
            FileNotFoundError: If required directories don't exist
        """
        if not self.dataset_path.exists():
            raise FileNotFoundError(
                f"Golden dataset not found at: {self.dataset_path}"
            )

        if not self.screenshots_path.exists():
            raise FileNotFoundError(
                f"Screenshots directory not found at: {self.screenshots_path}"
            )

        if not self.ground_truth_path.exists():
            raise FileNotFoundError(
                f"Ground truth directory not found at: {self.ground_truth_path}"
            )

    def _load_samples(self) -> List[Dict[str, Any]]:
        """
        Load all samples from the dataset.

        Returns:
            List of sample dictionaries with:
                - id: Screenshot ID
                - screenshot_path: Path to screenshot file
                - ground_truth: Loaded ground truth JSON

        Raises:
            ValueError: If ground truth file is missing for a screenshot
        """
        samples = []

        # Find all ground truth JSON files
        ground_truth_files = sorted(self.ground_truth_path.glob("*.json"))

        if not ground_truth_files:
            logger.warning(f"No ground truth files found in {self.ground_truth_path}")
            return samples

        for ground_truth_file in ground_truth_files:
            screenshot_id = ground_truth_file.stem  # Filename without extension

            # Load ground truth
            with open(ground_truth_file, 'r') as f:
                ground_truth = json.load(f)

            # Verify screenshot_id matches filename
            if ground_truth.get('screenshot_id') != screenshot_id:
                logger.warning(
                    f"Screenshot ID mismatch: filename={screenshot_id}, "
                    f"json={ground_truth.get('screenshot_id')}"
                )

            # Find corresponding screenshot
            screenshot_path = self.screenshots_path / f"{screenshot_id}.png"
            if not screenshot_path.exists():
                logger.warning(
                    f"Screenshot file not found for {screenshot_id}: {screenshot_path}"
                )
                # Continue anyway - screenshot might be added later
                screenshot_path = None

            samples.append({
                'id': screenshot_id,
                'screenshot_path': screenshot_path,
                'ground_truth': ground_truth,
            })

        logger.info(f"Loaded {len(samples)} samples from golden dataset")
        return samples

    def __len__(self) -> int:
        """Return the number of samples in the dataset."""
        return len(self._samples)

    def __getitem__(self, index: int) -> Dict[str, Any]:
        """
        Get a sample by index.

        Args:
            index: Sample index

        Returns:
            Dictionary with:
                - id: Screenshot ID
                - image: PIL Image object (if screenshot exists)
                - ground_truth: Ground truth data

        Raises:
            IndexError: If index is out of range
        """
        if index < 0 or index >= len(self._samples):
            raise IndexError(f"Index {index} out of range for dataset of size {len(self._samples)}")

        sample = self._samples[index]

        result = {
            'id': sample['id'],
            'ground_truth': sample['ground_truth'],
        }

        # Load image if screenshot exists
        if sample['screenshot_path'] and sample['screenshot_path'].exists():
            try:
                result['image'] = Image.open(sample['screenshot_path'])
            except Exception as e:
                logger.error(f"Failed to load screenshot {sample['screenshot_path']}: {e}")
                result['image'] = None
        else:
            result['image'] = None

        return result

    def __iter__(self) -> Iterator[Dict[str, Any]]:
        """
        Iterate over all samples in the dataset.

        Yields:
            Sample dictionaries with id, image, and ground_truth
        """
        for i in range(len(self)):
            yield self[i]

    def get_by_id(self, screenshot_id: str) -> Dict[str, Any]:
        """
        Get a sample by screenshot ID.

        Args:
            screenshot_id: Screenshot identifier

        Returns:
            Sample dictionary

        Raises:
            ValueError: If screenshot ID not found
        """
        for sample in self:
            if sample['id'] == screenshot_id:
                return sample

        raise ValueError(f"Screenshot ID not found: {screenshot_id}")

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get dataset statistics.

        Returns:
            Dictionary with dataset statistics:
                - total_samples: Total number of samples
                - samples_with_screenshots: Number with actual screenshot files
                - component_types: Count by expected pattern ID
                - avg_tokens_per_sample: Average number of tokens
        """
        total_samples = len(self._samples)
        samples_with_screenshots = sum(
            1 for s in self._samples
            if s['screenshot_path'] and s['screenshot_path'].exists()
        )

        # Count by component type
        component_types: Dict[str, int] = {}
        total_tokens = 0

        for sample in self._samples:
            pattern_id = sample['ground_truth'].get('expected_pattern_id', 'unknown')
            component_types[pattern_id] = component_types.get(pattern_id, 0) + 1

            # Count tokens
            expected_tokens = sample['ground_truth'].get('expected_tokens', {})
            for category in expected_tokens.values():
                if isinstance(category, dict):
                    total_tokens += len(category)

        return {
            'total_samples': total_samples,
            'samples_with_screenshots': samples_with_screenshots,
            'component_types': component_types,
            'avg_tokens_per_sample': total_tokens / total_samples if total_samples > 0 else 0,
        }
