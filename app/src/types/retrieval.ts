/**
 * Type definitions for Pattern Retrieval API (Epic 3)
 */

export interface RetrievalRequest {
  requirements: {
    component_type: string;
    props: string[];
    variants: string[];
    events?: string[];
    states?: string[];
    a11y: string[];
  };
}

export interface PatternMatch {
  pattern_id?: string; // Internal field name
  id?: string; // API field name (backend returns 'id')
  name: string;
  source: string;
  version: string;
  confidence: number;
  code: string;
  metadata: {
    description: string;
    props: string[];
    variants: string[];
    events?: string[];
    states?: string[];
    a11y: string[];
    dependencies?: string[];
    author?: string;
    tags?: string[];
  };
  scores: {
    bm25_score: number;
    bm25_rank: number;
    semantic_score: number;
    semantic_rank: number;
    weighted_score: number;
  };
  explanation: {
    match_reason: string;
    matched_props: string[];
    matched_variants: string[];
    matched_a11y: string[];
    weight_breakdown: {
      bm25_weight: number;
      semantic_weight: number;
    };
  };
}

export interface RetrievalMetadata {
  latency_ms: number;
  methods_used: string[];
  total_patterns_searched: number;
  query_construction?: {
    component_type: string;
    keywords: string[];
  };
}

export interface RetrievalResponse {
  patterns: PatternMatch[];
  retrieval_metadata: RetrievalMetadata;
}

export interface RetrievalError {
  error: string;
  detail?: string;
  status?: number;
}

export interface LibraryStatsResponse {
  total_patterns: number;
  component_types: string[];
  categories: string[];
  frameworks: string[];
  libraries: string[];
  total_variants: number;
  total_props: number;
  metrics?: {
    mrr: number;
    hit_at_3: number;
    last_evaluated?: string;
  };
}
