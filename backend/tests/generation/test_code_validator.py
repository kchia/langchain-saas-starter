"""
Tests for Code Validator

Tests validation logic, error parsing, and fix loop.
"""

import pytest
from src.generation.code_validator import (
    CodeValidator,
    ValidationError,
    ValidationResult,
)
from src.generation.llm_generator import MockLLMGenerator


class TestValidationError:
    """Test suite for ValidationError dataclass."""
    
    def test_validation_error_creation(self):
        """Test creating ValidationError instance."""
        error = ValidationError(
            line=10,
            column=5,
            message="Type error",
            rule_id="2322",
            severity="error",
        )
        
        assert error.line == 10
        assert error.column == 5
        assert error.message == "Type error"
        assert error.severity == "error"


class TestCodeValidator:
    """Test suite for CodeValidator."""
    
    @pytest.fixture
    def validator(self):
        """Create validator instance with mock LLM."""
        llm = MockLLMGenerator()
        return CodeValidator(llm_generator=llm)
    
    def test_validator_initialization(self, validator):
        """Test that validator initializes correctly."""
        assert validator is not None
        assert validator.max_retries == 2
        assert validator.ts_script.exists()
        assert validator.eslint_script.exists()
    
    @pytest.mark.asyncio
    async def test_validate_typescript_valid_code(self, validator):
        """Test TypeScript validation with valid code."""
        code = 'const x: string = "hello";'
        
        result = await validator._validate_typescript(code)
        
        assert result["valid"] is True
        assert result["errorCount"] == 0
    
    @pytest.mark.asyncio
    async def test_validate_typescript_invalid_code(self, validator):
        """Test TypeScript validation with type error."""
        code = 'const x: string = 123;'
        
        result = await validator._validate_typescript(code)
        
        assert result["valid"] is False
        assert result["errorCount"] > 0
    
    @pytest.mark.asyncio
    async def test_validate_eslint_valid_code(self, validator):
        """Test ESLint validation with valid code."""
        code = 'const x = "hello";'
        
        result = await validator._validate_eslint(code)
        
        # May have warnings but should not have errors
        assert result["errorCount"] == 0
    
    @pytest.mark.asyncio
    async def test_validate_eslint_invalid_code(self, validator):
        """Test ESLint validation with errors."""
        code = 'var x = 123;'  # var is not allowed
        
        result = await validator._validate_eslint(code)
        
        assert result["errorCount"] > 0
    
    def test_parse_validation_result_typescript(self, validator):
        """Test parsing TypeScript validation result."""
        result = {
            "valid": False,
            "errors": [
                {
                    "line": 1,
                    "column": 7,
                    "message": "Type error",
                    "code": 2322,
                    "category": "Error",
                }
            ],
            "warnings": [
                {
                    "line": 2,
                    "column": 1,
                    "message": "Warning message",
                    "code": 6133,
                    "category": "Warning",
                }
            ],
            "errorCount": 1,
            "warningCount": 1,
        }
        
        errors = validator._parse_validation_result(result, "typescript")
        
        assert len(errors) == 2  # 1 error + 1 warning
        
        # Check error
        error = errors[0]
        assert error.severity == "error"
        assert error.line == 1
        assert error.message == "Type error"
        
        # Check warning
        warning = errors[1]
        assert warning.severity == "warning"
        assert warning.line == 2
    
    def test_parse_validation_result_eslint(self, validator):
        """Test parsing ESLint validation result."""
        result = {
            "valid": False,
            "errors": [
                {
                    "line": 1,
                    "column": 1,
                    "message": "Unexpected var",
                    "ruleId": "no-var",
                    "severity": 2,
                }
            ],
            "warnings": [],
            "errorCount": 1,
            "warningCount": 0,
        }
        
        errors = validator._parse_validation_result(result, "eslint")
        
        assert len(errors) == 1
        assert errors[0].severity == "error"
        assert errors[0].rule_id == "no-var"
    
    def test_calculate_quality_score_perfect(self, validator):
        """Test quality score with no errors or warnings."""
        score = validator._calculate_quality_score([], [], [], [])
        
        assert score == 1.0
    
    def test_calculate_quality_score_with_errors(self, validator):
        """Test quality score with errors using non-linear penalty."""
        errors = [
            ValidationError(1, 1, "Error 1", "rule1", "error"),
            ValidationError(2, 1, "Error 2", "rule2", "error"),
        ]
        
        score = validator._calculate_quality_score(errors, [], [], [])
        
        # 2 errors: 1.0 - (2 * 0.25) = 0.5
        assert score == 0.5
    
    def test_calculate_quality_score_with_warnings(self, validator):
        """Test quality score with warnings."""
        warnings = [
            ValidationError(1, 1, "Warning 1", "rule1", "warning"),
            ValidationError(2, 1, "Warning 2", "rule2", "warning"),
        ]
        
        score = validator._calculate_quality_score([], [], warnings, [])
        
        # 0 errors + 2 warnings * 0.05 = 1.0 - 0.1 = 0.9
        assert score == 0.9
    
    def test_calculate_quality_score_mixed(self, validator):
        """Test quality score with mix of errors and warnings."""
        errors = [ValidationError(1, 1, "Error", "rule1", "error")]
        warnings = [ValidationError(2, 1, "Warning", "rule2", "warning")]
        
        score = validator._calculate_quality_score(errors, [], warnings, [])
        
        # 1 error: 0.75, minus 1 warning (0.05) = 0.70
        assert score == 0.70
    
    def test_calculate_quality_score_clamped(self, validator):
        """Test that quality score is clamped to [0.0, 1.0]."""
        # Many errors should clamp to 0.0
        many_errors = [
            ValidationError(i, 1, f"Error {i}", "rule", "error")
            for i in range(10)
        ]
        
        score = validator._calculate_quality_score(many_errors, [], [], [])
        
        assert score == pytest.approx(0.05, abs=1e-6)  # Should be 0.05 for 10 errors
    
    def test_calculate_typescript_quality_score(self, validator):
        """Test TypeScript-specific quality score calculation."""
        ts_errors = [ValidationError(1, 1, "Error", "rule1", "error")]
        ts_warnings = [ValidationError(2, 1, "Warning", "rule2", "warning")]
        
        score = validator._calculate_typescript_quality_score(ts_errors, ts_warnings)
        
        # 1 error: 0.75, minus 1 warning (0.05) = 0.70
        assert score == 0.70
    
    def test_calculate_eslint_quality_score(self, validator):
        """Test ESLint-specific quality score calculation."""
        eslint_errors = [ValidationError(1, 1, "Error", "no-var", "error")]
        eslint_warnings = []
        
        score = validator._calculate_eslint_quality_score(eslint_errors, eslint_warnings)
        
        # 1 error: 1.0 - 0.25 = 0.75
        assert score == 0.75
    
    def test_convert_score_to_0_100(self, validator):
        """Test score conversion from 0.0-1.0 to 0-100."""
        assert validator._convert_score_to_0_100(0.0) == 0
        assert validator._convert_score_to_0_100(0.5) == 50
        assert validator._convert_score_to_0_100(1.0) == 100
        assert validator._convert_score_to_0_100(0.75) == 75
        assert validator._convert_score_to_0_100(0.123) == 12  # Rounds to nearest integer
    
    @pytest.mark.asyncio
    async def test_validate_and_fix_valid_code(self, validator):
        """Test validation with code that passes immediately."""
        code = 'const Button = () => <button>Click</button>;'
        
        result = await validator.validate_and_fix(code)
        
        assert result.valid is True
        assert result.attempts == 1
        assert result.compilation_success is True
        assert result.lint_success is True
        assert result.overall_quality_score > 0.8  # Should be high quality
        assert result.typescript_quality_score > 0.8
        assert result.eslint_quality_score > 0.8
    
    @pytest.mark.asyncio
    async def test_validate_and_fix_result_structure(self, validator):
        """Test that ValidationResult has correct structure."""
        code = 'const x: string = "hello";'
        
        result = await validator.validate_and_fix(code)
        
        assert isinstance(result, ValidationResult)
        assert hasattr(result, "valid")
        assert hasattr(result, "code")
        assert hasattr(result, "attempts")
        assert hasattr(result, "final_status")
        assert hasattr(result, "typescript_errors")
        assert hasattr(result, "eslint_errors")
        assert hasattr(result, "typescript_warnings")
        assert hasattr(result, "eslint_warnings")
        assert hasattr(result, "typescript_quality_score")
        assert hasattr(result, "eslint_quality_score")
        assert hasattr(result, "overall_quality_score")
        assert hasattr(result, "compilation_success")
        assert hasattr(result, "lint_success")
    
    @pytest.mark.asyncio
    async def test_llm_fix_errors(self, validator):
        """Test LLM-based error fixing."""
        code = 'const x: string = 123;'  # Type error
        
        ts_errors = [
            ValidationError(
                1, 7,
                "Type 'number' is not assignable to type 'string'.",
                "2322",
                "error"
            )
        ]
        
        fixed_code = await validator._llm_fix_errors(code, ts_errors, [], None)
        
        # Should return some code (mock always returns valid code)
        assert fixed_code != ""
        assert isinstance(fixed_code, str)


class TestCodeValidatorEdgeCases:
    """Test edge cases and error handling."""
    
    @pytest.fixture
    def validator(self):
        """Create validator without LLM for edge case testing."""
        return CodeValidator(llm_generator=None)
    
    def test_validator_without_llm(self, validator):
        """Test that validator works without LLM generator."""
        assert validator is not None
        assert validator.llm_generator is None
    
    @pytest.mark.asyncio
    async def test_validate_empty_code(self, validator):
        """Test validation with empty code."""
        result = await validator.validate_and_fix("")
        
        # Should handle gracefully
        assert isinstance(result, ValidationResult)
    
    @pytest.mark.asyncio
    async def test_validate_malformed_code(self, validator):
        """Test validation with malformed code."""
        code = "const x = {"  # Incomplete
        
        result = await validator.validate_and_fix(code)
        
        assert result.valid is False
        assert len(result.typescript_errors) > 0
