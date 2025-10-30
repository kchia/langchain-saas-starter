"""
Validation module for quality report generation.

This module provides quality report generation for Epic 5 validation results,
aggregating TypeScript, ESLint, accessibility, keyboard, focus, contrast, and
token adherence validation results.
"""

from .report_generator import QualityReportGenerator, QualityReport
from .frontend_bridge import FrontendValidatorBridge

__all__ = ["QualityReportGenerator", "QualityReport", "FrontendValidatorBridge"]
