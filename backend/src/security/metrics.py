"""Security metrics for monitoring security events.

This module provides Prometheus metrics for tracking security-related events:
- Code sanitization failures
- PII detections
- Input validation failures
- Rate limit hits
"""

try:
    from prometheus_client import Counter
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False


# Code sanitization metrics
if PROMETHEUS_AVAILABLE:
    code_sanitization_failures = Counter(
        'code_sanitization_failures_total',
        'Unsafe code patterns detected in generated code',
        ['pattern', 'severity']
    )

    pii_detections = Counter(
        'pii_detections_total',
        'PII detected in uploads',
        ['entity_type']
    )

    input_validation_failures = Counter(
        'input_validation_failures_total',
        'Input validation failures',
        ['validation_type', 'reason']
    )

    security_events = Counter(
        'security_events_total',
        'Total security events',
        ['event_type', 'severity']
    )

    rate_limit_hits = Counter(
        'rate_limit_hits_total',
        'Rate limit violations',
        ['tier', 'endpoint']
    )
else:
    # Provide no-op counters when Prometheus is not available
    class NoOpCounter:
        """No-op counter that does nothing when Prometheus is not available."""
        def labels(self, **kwargs):
            return self
        
        def inc(self, amount=1):
            pass

    code_sanitization_failures = NoOpCounter()
    pii_detections = NoOpCounter()
    input_validation_failures = NoOpCounter()
    security_events = NoOpCounter()
    rate_limit_hits = NoOpCounter()


def record_code_sanitization_failure(pattern: str, severity: str):
    """Record a code sanitization failure metric.
    
    Args:
        pattern: The security pattern that was detected (e.g., 'eval', 'xss')
        severity: Severity level (critical, high, medium, low)
    """
    code_sanitization_failures.labels(pattern=pattern, severity=severity).inc()
    security_events.labels(event_type="code_sanitization", severity=severity).inc()


def record_pii_detection(entity_type: str):
    """Record a PII detection metric.
    
    Args:
        entity_type: Type of PII detected (e.g., 'email', 'ssn', 'phone')
    """
    pii_detections.labels(entity_type=entity_type).inc()
    security_events.labels(event_type="pii_detection", severity="high").inc()


def record_input_validation_failure(validation_type: str, reason: str):
    """Record an input validation failure metric.
    
    Args:
        validation_type: Type of validation (e.g., 'file_type', 'file_size', 'svg_security')
        reason: Reason for failure
    """
    input_validation_failures.labels(validation_type=validation_type, reason=reason).inc()
    security_events.labels(event_type="input_validation", severity="medium").inc()


def record_rate_limit_hit(tier: str, endpoint: str):
    """Record a rate limit hit metric.
    
    Args:
        tier: User tier (free, pro, enterprise)
        endpoint: Endpoint category (extract, generate, upload)
    """
    rate_limit_hits.labels(tier=tier, endpoint=endpoint).inc()
    security_events.labels(event_type="rate_limit", severity="medium").inc()
