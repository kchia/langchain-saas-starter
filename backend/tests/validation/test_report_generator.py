"""
Tests for Quality Report Generator

Tests report generation, status determination, and HTML/JSON formatting.
"""

import pytest
from datetime import datetime
from src.validation.report_generator import (
    QualityReportGenerator,
    QualityReport,
)


class TestQualityReport:
    """Test suite for QualityReport dataclass."""
    
    def test_quality_report_creation(self):
        """Test creating QualityReport instance."""
        report = QualityReport(
            timestamp="2025-01-08T12:00:00",
            overall_status="PASS",
            component_name="TestComponent",
            summary={
                "typescript": True,
                "eslint": True,
                "accessibility": True,
                "token_adherence": 0.95,
            },
            details={},
            auto_fixes=["fix1", "fix2"],
            recommendations=["rec1"],
        )
        
        assert report.timestamp == "2025-01-08T12:00:00"
        assert report.overall_status == "PASS"
        assert report.component_name == "TestComponent"
        assert len(report.auto_fixes) == 2
        assert len(report.recommendations) == 1
    
    def test_quality_report_to_dict(self):
        """Test converting QualityReport to dictionary."""
        report = QualityReport(
            timestamp="2025-01-08T12:00:00",
            overall_status="PASS",
            component_name="TestComponent",
            summary={"typescript": True},
            details={},
        )
        
        result = report.to_dict()
        
        assert isinstance(result, dict)
        assert result["timestamp"] == "2025-01-08T12:00:00"
        assert result["overall_status"] == "PASS"
        assert result["component_name"] == "TestComponent"
        assert "summary" in result
        assert "details" in result
        assert "auto_fixes" in result
        assert "recommendations" in result


class TestQualityReportGenerator:
    """Test suite for QualityReportGenerator."""
    
    @pytest.fixture
    def generator(self):
        """Create generator instance."""
        return QualityReportGenerator()
    
    @pytest.fixture
    def valid_results(self):
        """Create valid validation results."""
        return {
            "typescript": {
                "valid": True,
                "errorCount": 0,
                "warningCount": 0,
                "errors": [],
                "warnings": [],
            },
            "eslint": {
                "valid": True,
                "errorCount": 0,
                "warningCount": 0,
                "errors": [],
                "warnings": [],
            },
            "a11y": {
                "valid": True,
                "violations": [],
                "passes": [],
            },
            "keyboard": {
                "valid": True,
                "issues": [],
            },
            "focus": {
                "valid": True,
                "issues": [],
            },
            "contrast": {
                "valid": True,
                "violations": [],
            },
            "tokens": {
                "valid": True,
                "overall_score": 0.95,
                "adherence": {},
            },
            "auto_fixes": ["removed_unused_import"],
        }
    
    @pytest.fixture
    def invalid_results(self):
        """Create invalid validation results."""
        return {
            "typescript": {
                "valid": False,
                "errorCount": 2,
                "warningCount": 1,
                "errors": [{"message": "Type error"}],
                "warnings": [{"message": "Warning"}],
            },
            "eslint": {
                "valid": False,
                "errorCount": 1,
                "warningCount": 2,
                "errors": [{"message": "ESLint error"}],
                "warnings": [{"message": "Warning 1"}, {"message": "Warning 2"}],
            },
            "a11y": {
                "valid": False,
                "violations": [
                    {"impact": "critical", "message": "Critical violation"},
                    {"impact": "serious", "message": "Serious violation"},
                ],
                "passes": [],
            },
            "keyboard": {
                "valid": False,
                "issues": [{"message": "Keyboard issue"}],
            },
            "focus": {
                "valid": False,
                "issues": [{"message": "Focus issue"}],
            },
            "contrast": {
                "valid": False,
                "violations": [{"message": "Contrast issue"}],
            },
            "tokens": {
                "valid": False,
                "overall_score": 0.75,
                "adherence": {},
            },
            "auto_fixes": [],
        }
    
    def test_generator_initialization(self, generator):
        """Test that generator initializes correctly."""
        assert generator is not None
        assert generator.jinja_env is not None
    
    def test_generate_with_valid_results(self, generator, valid_results):
        """Test generating report with valid results."""
        report = generator.generate(valid_results, "TestComponent")
        
        assert isinstance(report, QualityReport)
        assert report.overall_status == "PASS"
        assert report.component_name == "TestComponent"
        assert report.summary["typescript"] is True
        assert report.summary["eslint"] is True
        assert report.summary["accessibility"] is True
        assert report.summary["token_adherence"] == 0.95
        assert len(report.auto_fixes) == 1
        assert report.timestamp is not None
    
    def test_generate_with_invalid_results(self, generator, invalid_results):
        """Test generating report with invalid results."""
        report = generator.generate(invalid_results, "TestComponent")
        
        assert isinstance(report, QualityReport)
        assert report.overall_status == "FAIL"
        assert report.summary["typescript"] is False
        assert report.summary["eslint"] is False
        assert report.summary["accessibility"] is False
        assert report.summary["token_adherence"] == 0.75
        assert len(report.recommendations) > 0
    
    def test_determine_status_all_pass(self, generator, valid_results):
        """Test status determination when all checks pass."""
        status = generator._determine_status(valid_results)
        assert status == "PASS"
    
    def test_determine_status_typescript_fail(self, generator, valid_results):
        """Test status determination when TypeScript fails."""
        valid_results["typescript"]["valid"] = False
        status = generator._determine_status(valid_results)
        assert status == "FAIL"
    
    def test_determine_status_eslint_fail(self, generator, valid_results):
        """Test status determination when ESLint fails."""
        valid_results["eslint"]["valid"] = False
        status = generator._determine_status(valid_results)
        assert status == "FAIL"
    
    def test_determine_status_a11y_fail(self, generator, valid_results):
        """Test status determination when accessibility fails."""
        valid_results["a11y"]["valid"] = False
        status = generator._determine_status(valid_results)
        assert status == "FAIL"
    
    def test_determine_status_token_adherence_fail(self, generator, valid_results):
        """Test status determination when token adherence < 90%."""
        valid_results["tokens"]["overall_score"] = 0.85
        status = generator._determine_status(valid_results)
        assert status == "FAIL"
    
    def test_determine_status_token_adherence_boundary(self, generator, valid_results):
        """Test status determination at token adherence boundary (90%)."""
        valid_results["tokens"]["overall_score"] = 0.90
        status = generator._determine_status(valid_results)
        assert status == "PASS"
    
    def test_create_summary(self, generator, valid_results):
        """Test creating validation summary."""
        summary = generator._create_summary(valid_results)
        
        assert summary["typescript"] is True
        assert summary["eslint"] is True
        assert summary["accessibility"] is True
        assert summary["keyboard"] is True
        assert summary["focus"] is True
        assert summary["contrast"] is True
        assert summary["token_adherence"] == 0.95
        assert summary["total_errors"] == 0
        assert summary["total_warnings"] == 0
    
    def test_count_total_errors(self, generator, invalid_results):
        """Test counting total errors."""
        total = generator._count_total_errors(invalid_results)
        
        # 2 TypeScript + 1 ESLint + 1 critical a11y = 4
        assert total == 4
    
    def test_count_total_warnings(self, generator, invalid_results):
        """Test counting total warnings."""
        total = generator._count_total_warnings(invalid_results)
        
        # 1 TypeScript + 2 ESLint + 1 serious a11y = 4
        assert total == 4
    
    def test_generate_recommendations_all_pass(self, generator, valid_results):
        """Test recommendations for passing validation."""
        recommendations = generator._generate_recommendations(valid_results)
        
        # Should have no recommendations when all pass
        assert len(recommendations) == 0
    
    def test_generate_recommendations_typescript_fail(self, generator, valid_results):
        """Test recommendations when TypeScript fails."""
        valid_results["typescript"]["valid"] = False
        recommendations = generator._generate_recommendations(valid_results)
        
        assert any("TypeScript" in rec for rec in recommendations)
    
    def test_generate_recommendations_eslint_fail(self, generator, valid_results):
        """Test recommendations when ESLint fails."""
        valid_results["eslint"]["valid"] = False
        recommendations = generator._generate_recommendations(valid_results)
        
        assert any("eslint --fix" in rec for rec in recommendations)
    
    def test_generate_recommendations_a11y_fail(self, generator, valid_results):
        """Test recommendations when accessibility fails."""
        valid_results["a11y"]["violations"] = [{"impact": "critical"}]
        recommendations = generator._generate_recommendations(valid_results)
        
        assert any("accessibility" in rec for rec in recommendations)
    
    def test_generate_recommendations_token_fail(self, generator, valid_results):
        """Test recommendations when token adherence fails."""
        valid_results["tokens"]["overall_score"] = 0.75
        recommendations = generator._generate_recommendations(valid_results)
        
        assert any("token adherence" in rec for rec in recommendations)
        assert any("75.0%" in rec for rec in recommendations)
    
    def test_generate_recommendations_keyboard_fail(self, generator, valid_results):
        """Test recommendations when keyboard navigation fails."""
        valid_results["keyboard"]["valid"] = False
        recommendations = generator._generate_recommendations(valid_results)
        
        assert any("keyboard" in rec for rec in recommendations)
    
    def test_generate_recommendations_focus_fail(self, generator, valid_results):
        """Test recommendations when focus indicators fail."""
        valid_results["focus"]["valid"] = False
        recommendations = generator._generate_recommendations(valid_results)
        
        assert any("focus" in rec for rec in recommendations)
    
    def test_generate_recommendations_contrast_fail(self, generator, valid_results):
        """Test recommendations when contrast fails."""
        valid_results["contrast"]["valid"] = False
        recommendations = generator._generate_recommendations(valid_results)
        
        assert any("contrast" in rec for rec in recommendations)
    
    def test_generate_html(self, generator, valid_results):
        """Test HTML report generation."""
        report = generator.generate(valid_results, "TestComponent")
        html = generator.generate_html(report)
        
        assert isinstance(html, str)
        assert "<!DOCTYPE html>" in html
        assert "TestComponent" in html
        assert report.overall_status in html
    
    def test_generate_html_with_auto_fixes(self, generator, valid_results):
        """Test HTML report includes auto-fixes."""
        report = generator.generate(valid_results, "TestComponent")
        html = generator.generate_html(report)
        
        assert "removed_unused_import" in html
        assert "Auto-Fixes Applied" in html
    
    def test_generate_html_with_recommendations(self, generator, invalid_results):
        """Test HTML report includes recommendations."""
        report = generator.generate(invalid_results, "TestComponent")
        html = generator.generate_html(report)
        
        assert "Recommendations" in html
        assert len(report.recommendations) > 0
    
    def test_generate_json(self, generator, valid_results):
        """Test JSON report generation."""
        report = generator.generate(valid_results, "TestComponent")
        json_data = generator.generate_json(report)
        
        assert isinstance(json_data, dict)
        assert json_data["overall_status"] == "PASS"
        assert json_data["component_name"] == "TestComponent"
        assert "summary" in json_data
        assert "details" in json_data
        assert "auto_fixes" in json_data
        assert "recommendations" in json_data
    
    def test_report_timestamp_format(self, generator, valid_results):
        """Test that timestamp is in ISO format."""
        report = generator.generate(valid_results, "TestComponent")
        
        # Should be able to parse as ISO format
        try:
            datetime.fromisoformat(report.timestamp.replace('Z', '+00:00'))
            timestamp_valid = True
        except ValueError:
            timestamp_valid = False
        
        assert timestamp_valid is True
    
    def test_generate_with_missing_fields(self, generator):
        """Test generating report with missing validation results."""
        partial_results = {
            "typescript": {"valid": True, "errorCount": 0, "warningCount": 0},
            # Missing other fields
        }
        
        report = generator.generate(partial_results, "TestComponent")
        
        # Should not crash and should default to False for missing checks
        assert isinstance(report, QualityReport)
        assert report.overall_status == "FAIL"  # Missing required checks
    
    def test_generate_with_empty_results(self, generator):
        """Test generating report with empty results."""
        empty_results = {}
        
        report = generator.generate(empty_results, "TestComponent")
        
        assert isinstance(report, QualityReport)
        assert report.overall_status == "FAIL"
        assert report.summary["total_errors"] == 0
        assert report.summary["total_warnings"] == 0
