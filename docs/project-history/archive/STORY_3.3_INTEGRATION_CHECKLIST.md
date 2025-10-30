# Story 3.3 Integration Verification Checklist

## Quick Verification Steps

This checklist helps verify that the frontend and backend integration for Story 3.3 (Rate Limiting) is working correctly.

### Prerequisites

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Redis running (via Docker Compose or standalone)
- [ ] Backend .env configured with:
  - `REDIS_HOST=localhost` (or Docker service name)
  - `REDIS_PORT=6379`
  - `OPENAI_API_KEY=<your-key>` (required for token extraction and generation)

### 1. Redis Connection Verification

**Test**: Verify Redis is running and backend can connect

**Steps**:
```bash
# Check Redis is running
docker-compose ps redis
# OR
redis-cli ping

# Start backend and check logs
cd backend && source venv/bin/activate && uvicorn src.main:app --reload
# Look for: "Redis connection verified: localhost:6379/0"
```

**Expected**:
- ✅ Redis service is running
- ✅ Backend logs show successful Redis connection
- ✅ No Redis connection errors in backend logs

**Status**: ___ PASS / ___ FAIL

---

### 2. Backend Rate Limiting Middleware Active

**Test**: Verify rate limiting middleware is registered

**Steps**:
1. Start backend
2. Check startup logs for "Rate limit middleware initialized"
3. Make a request to protected endpoint
4. Check response headers

**Expected Response Headers**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1730[timestamp]
```

**Status**: ___ PASS / ___ FAIL

---

### 3. Frontend Rate Limit Components Available

**Test**: Verify frontend components are properly imported

**Steps**:
```bash
cd app
# Check hook exists
ls src/hooks/useRateLimitHandler.ts
# Check component exists
ls src/components/composite/RateLimitAlert.tsx
# Check types exist
grep "RateLimitError" src/types/api.types.ts
```

**Expected**:
- ✅ useRateLimitHandler hook exists
- ✅ RateLimitAlert component exists
- ✅ RateLimitError class defined

**Status**: ___ PASS / ___ FAIL

---

### 4. Extract Page - Rate Limit on Screenshot Upload

**Test**: Trigger rate limit on screenshot token extraction

**Prerequisites**: Set Free tier rate limit (10 requests/minute)

**Steps**:
1. Go to http://localhost:3000/extract
2. Upload a valid screenshot
3. Click "Extract Tokens" 11 times rapidly (or wait for extractions and repeat)
4. Observe the 11th request

**Expected**:
- ✅ First 10 requests succeed
- ✅ 11th request shows RateLimitAlert component
- ✅ Alert displays countdown timer (e.g., "Please wait 52 seconds before trying again")
- ✅ Alert shows warning icon and yellow/orange styling
- ✅ Alert is dismissible with X button
- ✅ Countdown decrements every second
- ✅ Alert disappears when countdown reaches 0
- ✅ Regular error alert is NOT shown (only rate limit alert)

**Response in Network tab**:
```
Status: 429 Too Many Requests
Headers:
  Retry-After: 60
Response Body:
  { "detail": "Rate limit exceeded: 11/10 requests/min. Try again in XX seconds." }
```

**Status**: ___ PASS / ___ FAIL

---

### 5. Extract Page - Rate Limit on Figma Extraction

**Test**: Trigger rate limit on Figma token extraction

**Prerequisites**: Valid Figma PAT configured

**Steps**:
1. Go to http://localhost:3000/extract?tab=figma
2. Enter valid Figma PAT and validate
3. Enter Figma file URL
4. Click "Extract" 11 times rapidly
5. Observe the 11th request

**Expected**:
- ✅ First 10 requests succeed
- ✅ 11th request shows RateLimitAlert in Figma tab
- ✅ Same countdown and styling as screenshot tab
- ✅ Alert shows endpoint information if available

**Status**: ___ PASS / ___ FAIL

---

### 6. Preview Page - Rate Limit on Component Generation

**Test**: Trigger rate limit on component generation

**Prerequisites**: Complete workflow up to patterns page

**Steps**:
1. Complete: Upload → Extract → Patterns → Requirements
2. Navigate to /preview (generation auto-triggers)
3. After generation completes, click "Retry Generation" 10 times
4. Observe rate limit behavior

**Expected**:
- ✅ First 10 generation requests succeed
- ✅ 11th request shows RateLimitAlert
- ✅ Alert appears after the "Generation Failed" message
- ✅ Countdown timer works correctly
- ✅ Error card is NOT shown when rate limit alert is displayed
- ✅ Can retry after countdown expires

**Status**: ___ PASS / ___ FAIL

---

### 7. Rate Limit Headers in Responses

**Test**: Verify all responses include rate limit headers

**Steps**:
1. Open browser DevTools → Network tab
2. Make request to /api/v1/tokens/extract/screenshot
3. Check response headers

**Expected Headers (before rate limit)**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: [unix timestamp]
```

**Expected Headers (at rate limit)**:
```
Status: 429
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: [unix timestamp]
```

**Status**: ___ PASS / ___ FAIL

---

### 8. Countdown Timer Accuracy

**Test**: Verify countdown timer is accurate

**Steps**:
1. Trigger rate limit (extract or generate)
2. Note the "Retry-After" value in response headers
3. Watch the countdown in RateLimitAlert
4. Use a stopwatch to verify accuracy

**Expected**:
- ✅ Initial countdown matches Retry-After header
- ✅ Countdown decrements by 1 every second
- ✅ Countdown shows "X seconds" for < 60s
- ✅ Countdown shows "X minutes" or "Xm Ys" for ≥ 60s
- ✅ Alert disappears when countdown reaches 0
- ✅ Timer stops if alert is dismissed manually

**Status**: ___ PASS / ___ FAIL

---

### 9. Multiple Endpoints - Independent Rate Limits

**Test**: Verify rate limits are tracked per endpoint

**Steps**:
1. Make 10 requests to /extract endpoint (hit limit)
2. Immediately make request to /generate endpoint
3. Observe if generate endpoint is blocked

**Expected**:
- ✅ Extract endpoint returns 429 after 10 requests
- ✅ Generate endpoint still works (independent counter)
- ✅ Each endpoint has its own rate limit tracking

**Status**: ___ PASS / ___ FAIL

---

### 10. Alert Dismissal

**Test**: User can dismiss rate limit alert

**Steps**:
1. Trigger rate limit
2. Click X (dismiss) button on RateLimitAlert
3. Observe alert disappears

**Expected**:
- ✅ Alert has dismiss button (X icon)
- ✅ Clicking dismiss removes alert immediately
- ✅ Timer stops on dismissal
- ✅ User can still retry (error handling continues)

**Status**: ___ PASS / ___ FAIL

---

### 11. Accessibility

**Test**: Rate limit alert is accessible

**Steps**:
1. Trigger rate limit
2. Inspect RateLimitAlert with screen reader or DevTools
3. Navigate with keyboard only

**Expected**:
- ✅ Alert has `role="alert"` attribute
- ✅ Alert has `aria-live="polite"` 
- ✅ Dismiss button is keyboard accessible (Tab + Enter)
- ✅ Content is announced by screen readers
- ✅ Color contrast meets WCAG AA standards

**Status**: ___ PASS / ___ FAIL

---

### 12. Retry After Cooldown

**Test**: User can successfully retry after rate limit expires

**Steps**:
1. Trigger rate limit on extract endpoint
2. Wait for countdown to reach 0
3. Try extracting tokens again
4. Verify request succeeds

**Expected**:
- ✅ Alert disappears when countdown reaches 0
- ✅ Next request after cooldown succeeds
- ✅ No residual rate limit state
- ✅ Response includes updated X-RateLimit-Remaining

**Status**: ___ PASS / ___ FAIL

---

### 13. Backend Metrics Recording

**Test**: Rate limit violations are recorded in metrics

**Steps**:
1. Trigger rate limit on extract endpoint
2. Navigate to http://localhost:8000/metrics
3. Search for `rate_limit_hits_total`

**Expected Metrics**:
```
# TYPE rate_limit_hits_total counter
rate_limit_hits_total{tier="free",endpoint="extract"} 1.0
rate_limit_hits_total{tier="free",endpoint="generate"} 0.0
security_events_total{event_type="rate_limit",severity="medium"} 1.0
```

**Status**: ___ PASS / ___ FAIL

---

### 14. Backend Logging

**Test**: Rate limit events are logged

**Steps**:
1. Monitor backend logs: `tail -f backend/logs/app.log` (or console)
2. Trigger rate limit
3. Check for log entry

**Expected Log Entry**:
```json
{
  "timestamp": "2025-10-28T20:00:00Z",
  "level": "INFO",
  "message": "Rate limit hit: user=ip:127.0.0.1, tier=free, endpoint=extract",
  "event": "rate_limit_hit",
  "user_id": "ip:127.0.0.1",
  "tier": "free",
  "endpoint": "extract"
}
```

**Status**: ___ PASS / ___ FAIL

---

### 15. Graceful Degradation - Redis Down

**Test**: System behavior when Redis is unavailable

**Steps**:
1. Stop Redis: `docker-compose stop redis`
2. Try making extract/generate requests
3. Observe error handling

**Expected**:
- ✅ Backend logs error about Redis connection
- ✅ Requests either fail gracefully OR bypass rate limiting
- ✅ User sees appropriate error message
- ✅ System doesn't crash

**Note**: This is a degraded state - rate limiting won't work without Redis

**Status**: ___ PASS / ___ FAIL

---

## Summary

**Total Tests**: 15
**Passed**: ___
**Failed**: ___
**Skipped**: ___

### Integration Status

- [ ] All critical tests pass (Tests 1-12)
- [ ] Metrics and logging work (Tests 13-14)
- [ ] Graceful degradation verified (Test 15)
- [ ] No console errors in browser
- [ ] No backend errors except expected rate limit responses

### Issues Found

_List any issues discovered during verification:_

1. 
2. 
3. 

### Next Steps

Based on verification results:

- [ ] Fix any failing tests
- [ ] Update documentation if behavior differs from spec
- [ ] Run E2E test suite: `cd app && npm run test:e2e`
- [ ] Mark Story 3.3 integration as complete
- [ ] Merge PR after review

---

## Notes

- Tests 1-3 verify the prerequisites are set up correctly
- Tests 4-6 verify the integration in both frontend pages
- Tests 7-12 verify detailed functionality and UX
- Tests 13-14 verify observability
- Test 15 verifies graceful degradation
- Some tests require rapid clicking - use browser automation or network throttling

---

## Test Fixtures

For manual testing, you can use these test files:

1. **Valid screenshot**: Any PNG/JPG < 10MB with UI elements
2. **Figma file**: Any public Figma file URL
3. **Figma PAT**: Get from https://www.figma.com/developers/api#access-tokens

Most test assets should already exist from Story 3.1 integration.

---

## Debugging Tips

### If rate limiting doesn't trigger:

1. Check Redis is running: `docker-compose ps redis`
2. Check backend logs for Redis connection
3. Verify middleware is registered in `backend/src/main.py`
4. Check rate limiter initialization in backend logs

### If alert doesn't appear:

1. Check browser console for JavaScript errors
2. Verify response status is 429
3. Check response includes Retry-After header
4. Verify `useRateLimitHandler` hook is imported
5. Verify `RateLimitAlert` component is rendered conditionally

### If countdown is inaccurate:

1. Check Retry-After header value in Network tab
2. Verify timer interval in useRateLimitHandler (should be 1000ms)
3. Check for multiple timer instances (memory leak)

### If tests fail after passing:

1. Clear Redis: `redis-cli FLUSHALL`
2. Restart backend
3. Clear browser cache and cookies
4. Check system clock is accurate
