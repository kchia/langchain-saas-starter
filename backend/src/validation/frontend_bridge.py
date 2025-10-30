"""
Epic 5: Integration helper for calling frontend validators from backend
"""

import json
import subprocess
import tempfile
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class FrontendValidatorBridge:
    """
    Bridge to call Epic 5 frontend validators from Python backend
    """

    def __init__(self):
        # Look for the script in the backend/scripts directory
        self.script_path = Path(__file__).parent.parent.parent / "scripts" / "run_validators.js"
        if not self.script_path.exists():
            raise FileNotFoundError(f"Validator script not found: {self.script_path}")

    async def validate_all(
        self,
        component_code: str,
        component_name: str = "Component",
        design_tokens: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Run all Epic 5 frontend validators on component code

        Args:
            component_code: React component TypeScript code
            component_name: Name of the component
            design_tokens: Optional design tokens for token adherence validation

        Returns:
            Dictionary with validation results from all validators
        """
        # Create temporary files for input
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".tsx", delete=False
        ) as code_file:
            code_file.write(component_code)
            code_path = code_file.name

        tokens_path = None
        if design_tokens:
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".json", delete=False
            ) as tokens_file:
                json.dump(design_tokens, tokens_file)
                tokens_path = tokens_file.name

        try:
            # Build command
            cmd = ["node", str(self.script_path), code_path, component_name]
            if tokens_path:
                cmd.append(tokens_path)

            # Execute validator script
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,  # 30s timeout for validation
            )

            if result.returncode != 0:
                logger.error(f"Validator script failed: {result.stderr}")
                return self._get_error_result(result.stderr)

            # Parse JSON results
            try:
                validation_results = json.loads(result.stdout)
                return validation_results
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse validator output: {e}")
                logger.error(f"Output was: {result.stdout}")
                return self._get_error_result(f"JSON parse error: {e}")

        except subprocess.TimeoutExpired:
            logger.error("Validator script timed out")
            return self._get_error_result("Validation timed out after 30s")
        except Exception as e:
            logger.error(f"Unexpected error running validators: {e}")
            return self._get_error_result(str(e))
        finally:
            # Cleanup temporary files
            Path(code_path).unlink(missing_ok=True)
            if tokens_path:
                Path(tokens_path).unlink(missing_ok=True)

    def _get_error_result(self, error_message: str) -> Dict[str, Any]:
        """Return error result structure"""
        return {
            "error": error_message,
            "a11y": {"valid": False, "errors": [error_message], "warnings": []},
            "keyboard": {"valid": False, "errors": [error_message], "warnings": []},
            "focus": {"valid": False, "errors": [error_message], "warnings": []},
            "contrast": {"valid": False, "errors": [error_message], "warnings": []},
            "tokens": {
                "valid": False,
                "errors": [error_message],
                "warnings": [],
                "adherenceScore": 0.0,
            },
        }
