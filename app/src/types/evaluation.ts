/**
 * Type definitions for evaluation metrics.
 *
 * These types correspond to the backend evaluation API responses.
 */

export interface StageFailures {
  token_extraction: number;
  retrieval: number;
  generation: number;
}

export interface TokenExtractionMetrics {
  avg_accuracy: number;
}

export interface RetrievalMetrics {
  mrr: number;
  hit_at_3: number;
  precision_at_1: number;
}

export interface GenerationMetrics {
  compilation_rate: number;
  avg_quality_score: number;
  success_rate: number;
  avg_generation_time_ms?: number;
}

export interface OverallMetrics {
  pipeline_success_rate: number;
  avg_latency_ms: number;
  stage_failures: StageFailures;
  token_extraction: TokenExtractionMetrics;
  retrieval: RetrievalMetrics;
  generation: GenerationMetrics;
}

export interface TokenExtractionResult {
  accuracy: number;
  missing_tokens: string[];
  incorrect_tokens: string[];
}

export interface RetrievalResult {
  correct: boolean;
  expected: string;
  retrieved: string;
  rank: number;
  confidence?: number;
}

export interface GenerationResult {
  code_generated: boolean;
  code_compiles: boolean;
  quality_score: number;
  validation_errors: string[];
  generation_time_ms?: number;
}

export interface PerScreenshotResult {
  screenshot_id: string;
  pipeline_success: boolean;
  total_latency_ms: number;
  token_extraction: TokenExtractionResult;
  retrieval: RetrievalResult;
  generation: GenerationResult;
}

export interface CategoryMetrics {
  mrr: number;
  hit_at_3: number;
  precision_at_1: number;
}

export interface RetrievalOnlyMetrics {
  mrr: number;
  hit_at_3: number;
  precision_at_1: number;
  test_queries: number;
  per_category: {
    keyword: CategoryMetrics;
    semantic: CategoryMetrics;
    mixed: CategoryMetrics;
  };
  query_results?: Array<{
    query: string;
    expected: string;
    retrieved: string;
    correct: boolean;
    rank: number;
    confidence: number;
    category: string;
  }>;
}

export interface EvaluationMetrics {
  overall: OverallMetrics;
  per_screenshot: PerScreenshotResult[];
  retrieval_only?: RetrievalOnlyMetrics;
  dataset_size: number;
  timestamp: string;
}

export interface EvaluationStatus {
  ready: boolean;
  api_key_configured: boolean;
  golden_dataset: {
    loaded: boolean;
    size: number;
    statistics: {
      total_samples: number;
      samples_with_screenshots: number;
      component_types: Record<string, number>;
      avg_tokens_per_sample: number;
    };
  };
  retrieval_queries: {
    total: number;
    keyword: number;
    semantic: number;
    mixed: number;
  };
  message: string;
}
