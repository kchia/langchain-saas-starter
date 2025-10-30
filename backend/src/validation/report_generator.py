"""
Quality Report Generator for Epic 5

Generates comprehensive quality reports aggregating:
- TypeScript compilation results (Epic 4.5)
- ESLint/Prettier results (Epic 4.5)
- Accessibility audit summary (Epic 5)
- Keyboard navigation results (Epic 5)
- Focus indicator validation (Epic 5)
- Color contrast results (Epic 5)
- Token adherence score (Epic 5)
- Auto-fix summary
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


@dataclass
class QualityReport:
    """Quality report data structure."""
    
    timestamp: str
    overall_status: str
    component_name: str
    summary: Dict[str, Any]
    details: Dict[str, Any]
    auto_fixes: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        """Convert report to dictionary."""
        return {
            "timestamp": self.timestamp,
            "overall_status": self.overall_status,
            "component_name": self.component_name,
            "summary": self.summary,
            "details": self.details,
            "auto_fixes": self.auto_fixes,
            "recommendations": self.recommendations,
        }


class QualityReportGenerator:
    """
    Generates comprehensive quality reports for component validation.
    
    Aggregates validation results from Epic 4.5 and Epic 5:
    - TypeScript compilation
    - ESLint/Prettier
    - Accessibility (axe-core)
    - Keyboard navigation
    - Focus indicators
    - Color contrast
    - Token adherence
    """
    
    def __init__(self):
        """Initialize the quality report generator."""
        # Set up Jinja2 template environment
        template_dir = Path(__file__).parent / "templates"
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=True
        )
    
    def generate(
        self,
        validation_results: Dict[str, Any],
        component_name: str = "Component"
    ) -> QualityReport:
        """
        Generate comprehensive quality report.
        
        Args:
            validation_results: Dictionary containing all validation results
            component_name: Name of the component being validated
            
        Returns:
            QualityReport object with JSON and HTML formats
            
        Example validation_results structure:
        {
            "typescript": {"valid": True, "errorCount": 0, "errors": [], "warnings": []},
            "eslint": {"valid": True, "errorCount": 0, "errors": [], "warnings": []},
            "a11y": {"valid": True, "violations": [], "passes": []},
            "keyboard": {"valid": True, "issues": []},
            "focus": {"valid": True, "issues": []},
            "contrast": {"valid": True, "violations": []},
            "tokens": {"valid": True, "overall_score": 0.95, "adherence": {}},
            "auto_fixes": ["removed_unused_import", "added_aria_label"]
        }
        """
        timestamp = datetime.utcnow().isoformat()
        
        # Determine overall status
        overall_status = self._determine_status(validation_results)
        
        # Create summary
        summary = self._create_summary(validation_results)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(validation_results)
        
        # Extract auto-fixes
        auto_fixes = validation_results.get("auto_fixes", [])
        
        return QualityReport(
            timestamp=timestamp,
            overall_status=overall_status,
            component_name=component_name,
            summary=summary,
            details=validation_results,
            auto_fixes=auto_fixes,
            recommendations=recommendations,
        )
    
    def _determine_status(self, results: Dict[str, Any]) -> str:
        """
        Determine overall pass/fail status.
        
        Critical checks:
        - TypeScript compilation must pass
        - ESLint validation must pass
        - Accessibility must pass (no critical violations)
        - Token adherence must be ≥90%
        
        Args:
            results: Validation results dictionary
            
        Returns:
            "PASS" or "FAIL"
        """
        # Check critical validations
        typescript_valid = results.get("typescript", {}).get("valid", False)
        eslint_valid = results.get("eslint", {}).get("valid", False)
        a11y_valid = results.get("a11y", {}).get("valid", False)
        
        # Check token adherence (≥90% required)
        token_score = results.get("tokens", {}).get("overall_score", 0.0)
        token_valid = token_score >= 0.90
        
        # All critical checks must pass
        if typescript_valid and eslint_valid and a11y_valid and token_valid:
            return "PASS"
        else:
            return "FAIL"
    
    def _create_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create validation summary.
        
        Args:
            results: Validation results dictionary
            
        Returns:
            Summary dictionary with key metrics
        """
        return {
            "typescript": results.get("typescript", {}).get("valid", False),
            "eslint": results.get("eslint", {}).get("valid", False),
            "accessibility": results.get("a11y", {}).get("valid", False),
            "keyboard": results.get("keyboard", {}).get("valid", False),
            "focus": results.get("focus", {}).get("valid", False),
            "contrast": results.get("contrast", {}).get("valid", False),
            "token_adherence": results.get("tokens", {}).get("overall_score", 0.0),
            "total_errors": self._count_total_errors(results),
            "total_warnings": self._count_total_warnings(results),
        }
    
    def _count_total_errors(self, results: Dict[str, Any]) -> int:
        """Count total errors across all validations."""
        total = 0
        
        # TypeScript errors
        typescript_errors = results.get("typescript", {}).get("errors", [])
        total += len(typescript_errors)
        
        # ESLint errors
        eslint_errors = results.get("eslint", {}).get("errors", [])
        total += len(eslint_errors)
        
        # Accessibility errors
        a11y_errors = results.get("a11y", {}).get("errors", [])
        total += len(a11y_errors)
        
        # Keyboard errors
        keyboard_errors = results.get("keyboard", {}).get("errors", [])
        total += len(keyboard_errors)
        
        # Focus errors
        focus_errors = results.get("focus", {}).get("errors", [])
        total += len(focus_errors)
        
        # Contrast errors
        contrast_errors = results.get("contrast", {}).get("errors", [])
        total += len(contrast_errors)
        
        # Token errors
        token_errors = results.get("tokens", {}).get("errors", [])
        total += len(token_errors)
        
        return total
    
    def _count_total_warnings(self, results: Dict[str, Any]) -> int:
        """Count total warnings across all validations."""
        total = 0
        
        # TypeScript warnings
        total += results.get("typescript", {}).get("warningCount", 0)
        
        # ESLint warnings
        total += results.get("eslint", {}).get("warningCount", 0)
        
        # Accessibility serious violations
        a11y_violations = results.get("a11y", {}).get("violations", [])
        total += len([v for v in a11y_violations if v.get("impact") == "serious"])
        
        return total
    
    def _generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """
        Generate recommendations based on validation results.
        
        Args:
            results: Validation results dictionary
            
        Returns:
            List of recommendation strings
        """
        recommendations = []
        
        # TypeScript recommendations
        if not results.get("typescript", {}).get("valid", False):
            recommendations.append(
                "Fix TypeScript compilation errors before proceeding"
            )
        
        # ESLint recommendations
        if not results.get("eslint", {}).get("valid", False):
            recommendations.append(
                "Run 'eslint --fix' to automatically fix linting issues"
            )
        
        # Accessibility recommendations
        a11y_violations = results.get("a11y", {}).get("violations", [])
        if a11y_violations:
            recommendations.append(
                f"Fix {len(a11y_violations)} accessibility violations for WCAG compliance"
            )
        
        # Token adherence recommendations
        token_score = results.get("tokens", {}).get("overall_score", 0.0)
        if token_score < 0.90:
            recommendations.append(
                f"Increase token adherence from {token_score:.1%} to ≥90%"
            )
        
        # Keyboard navigation recommendations
        if not results.get("keyboard", {}).get("valid", False):
            recommendations.append(
                "Ensure all interactive elements are keyboard accessible"
            )
        
        # Focus indicator recommendations
        if not results.get("focus", {}).get("valid", False):
            recommendations.append(
                "Add visible focus indicators with ≥3:1 contrast ratio"
            )
        
        # Color contrast recommendations
        if not results.get("contrast", {}).get("valid", False):
            recommendations.append(
                "Fix color contrast issues to meet WCAG AA standards (4.5:1 for text)"
            )
        
        return recommendations
    
    def generate_html(self, report: QualityReport) -> str:
        """
        Generate HTML report using Jinja2 template.
        
        Args:
            report: QualityReport object
            
        Returns:
            HTML string
        """
        template = self.jinja_env.get_template("quality_report.html")
        return template.render(report=report.to_dict())
    
    def generate_json(self, report: QualityReport) -> dict:
        """
        Generate JSON report.
        
        Args:
            report: QualityReport object
            
        Returns:
            Dictionary suitable for JSON serialization
        """
        return report.to_dict()
