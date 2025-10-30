/**
 * Mock data fixtures for Pattern Selection E2E tests
 */

export const mockPatternResponse = {
  patterns: [
    {
      id: 'shadcn-button',
      name: 'Button',
      category: 'form',
      description: 'A customizable button component with multiple variants',
      framework: 'React',
      library: 'shadcn/ui',
      code: `export const Button = ({ variant = 'primary', size = 'md', ...props }) => {
  return <button className={\`btn btn-\${variant} btn-\${size}\`} {...props} />;
};`,
      metadata: {
        props: [
          { name: 'variant', type: 'string' },
          { name: 'size', type: 'string' },
          { name: 'disabled', type: 'boolean' }
        ],
        variants: [
          { name: 'primary' },
          { name: 'secondary' },
          { name: 'ghost' }
        ],
        a11y: ['aria-label', 'role']
      },
      confidence: 0.92,
      explanation: 'Perfect match: Button component with variant, size props and primary, secondary, ghost variants',
      match_highlights: {
        matched_props: ['variant', 'size'],
        matched_variants: ['primary', 'secondary', 'ghost'],
        matched_a11y: ['aria-label']
      },
      ranking_details: {
        bm25_score: 15.4,
        bm25_rank: 1,
        semantic_score: 0.89,
        semantic_rank: 1,
        final_score: 0.92,
        final_rank: 1
      }
    },
    {
      id: 'radix-button',
      name: 'Button',
      category: 'form',
      description: 'Radix UI button primitive with composable styling',
      framework: 'React',
      library: 'Radix UI',
      code: 'export const Button = ({ asChild, ...props }) => { /* ... */ }',
      metadata: {
        props: [
          { name: 'asChild', type: 'boolean' }
        ],
        variants: [],
        a11y: ['role', 'aria-pressed']
      },
      confidence: 0.68,
      explanation: 'Partial match: Button component but different prop structure',
      match_highlights: {
        matched_props: [],
        matched_variants: [],
        matched_a11y: []
      },
      ranking_details: {
        bm25_score: 8.2,
        bm25_rank: 2,
        semantic_score: 0.65,
        semantic_rank: 3,
        final_score: 0.68,
        final_rank: 2
      }
    },
    {
      id: 'headlessui-button',
      name: 'Button',
      category: 'form',
      description: 'HeadlessUI unstyled button component',
      framework: 'React',
      library: 'HeadlessUI',
      code: 'export const Button = ({ as, ...props }) => { /* ... */ }',
      metadata: {
        props: [
          { name: 'as', type: 'string' }
        ],
        variants: [],
        a11y: ['aria-label']
      },
      confidence: 0.58,
      explanation: 'Basic match: Button component with minimal features',
      match_highlights: {
        matched_props: [],
        matched_variants: [],
        matched_a11y: ['aria-label']
      },
      ranking_details: {
        bm25_score: 6.1,
        bm25_rank: 3,
        semantic_score: 0.54,
        semantic_rank: 4,
        final_score: 0.58,
        final_rank: 3
      }
    }
  ],
  retrieval_metadata: {
    latency_ms: 450,
    methods_used: ['bm25', 'semantic'],
    weights: {
      bm25: 0.3,
      semantic: 0.7
    },
    total_patterns_searched: 10,
    query: 'Button component with variant, size and disabled props'
  }
};

export const mockEmptyResponse = {
  patterns: [],
  retrieval_metadata: {
    latency_ms: 200,
    methods_used: ['bm25', 'semantic'],
    weights: { bm25: 0.3, semantic: 0.7 },
    total_patterns_searched: 10,
    query: 'Unknown component type'
  }
};

export const mockErrorResponse = {
  detail: 'Retrieval service error'
};
