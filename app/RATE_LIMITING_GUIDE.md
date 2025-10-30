# Rate Limiting - Frontend Implementation

This document explains how to use the rate limiting features implemented in Story 3.3.

## Components

### 1. RateLimitError

A custom error class that extends Error and includes rate limit information.

```typescript
import { RateLimitError } from '@/types';

// The error is automatically thrown by the API client when receiving 429 responses
// You can check for it in try-catch blocks or error handlers
```

### 2. useRateLimitHandler Hook

A React hook that manages rate limit state and countdown timer.

```typescript
import { useRateLimitHandler } from '@/hooks/useRateLimitHandler';

function MyComponent() {
  const {
    rateLimitState,
    handleRateLimitError,
    clearRateLimit,
    isRateLimitError,
  } = useRateLimitHandler();

  // Handle API calls
  const handleSubmit = async () => {
    try {
      await apiClient.post('/tokens/extract/screenshot', data);
    } catch (error) {
      if (isRateLimitError(error)) {
        handleRateLimitError(error);
      }
    }
  };

  return (
    <div>
      {rateLimitState.isRateLimited && (
        <RateLimitAlert
          retryAfter={rateLimitState.retryAfter}
          message={rateLimitState.message}
          endpoint={rateLimitState.endpoint}
          onDismiss={clearRateLimit}
        />
      )}
      {/* Your form/content */}
    </div>
  );
}
```

### 3. RateLimitAlert Component

A UI component that displays rate limit warnings with countdown timer.

```typescript
import { RateLimitAlert } from '@/components/composite/RateLimitAlert';

<RateLimitAlert
  retryAfter={60}  // seconds until retry is allowed
  message="You have exceeded the rate limit."  // optional custom message
  endpoint="/api/v1/extract"  // optional endpoint that was rate limited
  onDismiss={() => {}}  // optional dismiss handler
/>
```

## Usage Example

### Complete Integration Example

```typescript
'use client';

import React, { useState } from 'react';
import { useRateLimitHandler } from '@/hooks/useRateLimitHandler';
import { RateLimitAlert } from '@/components/composite/RateLimitAlert';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

export default function ExtractPage() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    rateLimitState,
    handleRateLimitError,
    clearRateLimit,
    isRateLimitError,
  } = useRateLimitHandler();

  const handleExtract = async (file: File) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/tokens/extract/screenshot', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Handle success
      console.log('Extraction successful:', response.data);
      
    } catch (error) {
      if (isRateLimitError(error)) {
        // Handle rate limit error
        handleRateLimitError(error);
      } else {
        // Handle other errors
        console.error('Extraction failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Token Extraction</h1>
      
      {/* Rate Limit Alert */}
      {rateLimitState.isRateLimited && (
        <div className="mb-4">
          <RateLimitAlert
            retryAfter={rateLimitState.retryAfter}
            message={rateLimitState.message}
            endpoint={rateLimitState.endpoint}
            onDismiss={clearRateLimit}
          />
        </div>
      )}
      
      {/* Your form content */}
      <Button
        onClick={() => handleExtract(/* file */)}
        disabled={isLoading || rateLimitState.isRateLimited}
      >
        {isLoading ? 'Extracting...' : 'Extract Tokens'}
      </Button>
    </div>
  );
}
```

## API Client Configuration

The API client automatically handles 429 responses:

```typescript
// app/src/lib/api/client.ts

// When the backend returns a 429 status:
// 1. Parse the Retry-After header (defaults to 60 seconds if missing)
// 2. Create a RateLimitError with retry information
// 3. Reject the promise with the RateLimitError
```

### Backend Rate Limit Response Format

The backend should return:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{
  "detail": "Rate limit exceeded. Please try again in 60 seconds."
}
```

## Testing

### Unit Tests

```bash
# Run all rate limit unit tests
npm run test -- --project=unit src/hooks/__tests__/useRateLimitHandler.test.ts
npm run test -- --project=unit src/components/composite/__tests__/RateLimitAlert.test.tsx
npm run test -- --project=unit src/lib/api/__tests__/rate-limit-handling.test.ts

# Run all unit tests
npm run test -- --project=unit
```

### E2E Tests

```bash
# Run rate limiting E2E tests
npm run test:e2e e2e/rate-limiting.spec.ts

# Run all E2E tests
npm run test:e2e
```

## Features

- ✅ Automatic detection of 429 rate limit errors
- ✅ Parsing of Retry-After header with fallback
- ✅ Countdown timer with automatic updates
- ✅ User-friendly error messages
- ✅ Endpoint information display
- ✅ Dismissible alerts
- ✅ Accessible UI with proper ARIA attributes
- ✅ TypeScript type safety
- ✅ Comprehensive test coverage (46 unit tests)

## Accessibility

The RateLimitAlert component includes:

- `role="alert"` for screen reader announcements
- `aria-live="polite"` for non-intrusive updates
- `aria-atomic="true"` for complete message reading
- Keyboard accessible dismiss button
- Clear, descriptive text for countdown

## Customization

### Custom Messages

```typescript
<RateLimitAlert
  retryAfter={30}
  message="You've hit the free tier limit. Upgrade to continue."
  onDismiss={handleDismiss}
/>
```

### Styling

The component uses Tailwind CSS and can be customized through className:

```typescript
<RateLimitAlert
  retryAfter={30}
  className="my-custom-class"
/>
```

## Best Practices

1. **Always show rate limit alerts** - Don't silently fail
2. **Disable actions during rate limit** - Prevent wasted user effort
3. **Provide clear next steps** - Tell users what to do
4. **Show endpoint context** - Help users understand what triggered the limit
5. **Auto-retry when safe** - After countdown expires, allow retry
6. **Track metrics** - Monitor rate limit hits to adjust backend limits

## Future Enhancements (Story 3.3.3 - Optional)

- [ ] Rate limit status display showing remaining requests
- [ ] Progress bar for usage visualization
- [ ] Proactive warnings before hitting limit
- [ ] Tier-specific messaging (Free, Pro, Enterprise)
- [ ] Request queue management
