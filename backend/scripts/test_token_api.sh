#!/bin/bash

# Test script for token extraction API
# Usage: ./test_token_api.sh

set -e

API_URL="http://localhost:8000"
TEST_DIR="/tmp/token_api_test"

echo "🧪 Token Extraction API Test"
echo "=============================="
echo ""

# Create test directory
mkdir -p "$TEST_DIR"

# Check if server is running
echo "1. Checking server health..."
if curl -s "${API_URL}/health" | grep -q "healthy"; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Start with: cd backend && source venv/bin/activate && uvicorn src.main:app"
    exit 1
fi
echo ""

# Test defaults endpoint
echo "2. Testing GET /api/v1/tokens/defaults..."
DEFAULTS=$(curl -s "${API_URL}/api/v1/tokens/defaults")
if echo "$DEFAULTS" | grep -q "shadcn/ui"; then
    echo "✅ Defaults endpoint works"
    echo "   Primary color: $(echo "$DEFAULTS" | jq -r '.tokens.colors.primary')"
else
    echo "❌ Defaults endpoint failed"
    exit 1
fi
echo ""

# Create a test image using Python
echo "3. Creating test image..."
# Check for python3 or python
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python 3."
    exit 1
fi

$PYTHON_CMD << 'EOF'
from PIL import Image, ImageDraw
import os

test_dir = "/tmp/token_api_test"
image = Image.new("RGB", (1200, 800), color="#FFFFFF")
draw = ImageDraw.Draw(image)

# Draw a blue button
draw.rectangle([100, 100, 300, 180], fill="#3B82F6")

# Draw text-like elements
draw.rectangle([100, 200, 500, 220], fill="#09090B")

# Draw a secondary element
draw.rectangle([100, 300, 600, 400], fill="#F1F5F9")

image.save(f"{test_dir}/test_screenshot.png")
print(f"✅ Test image created: {test_dir}/test_screenshot.png")
EOF
echo ""

# Test screenshot extraction (requires OpenAI API key)
echo "4. Testing POST /api/v1/tokens/extract/screenshot..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. Skipping extraction test."
    echo "   Set OPENAI_API_KEY to test actual extraction."
else
    echo "   Uploading test image..."
    RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/tokens/extract/screenshot" \
        -F "file=@${TEST_DIR}/test_screenshot.png" \
        -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Extraction successful"
        echo "   Primary color: $(echo "$BODY" | jq -r '.tokens.colors.primary')"
        echo "   Confidence: $(echo "$BODY" | jq -r '.confidence.colors.primary')"
        
        FALLBACKS=$(echo "$BODY" | jq -r '.fallbacks_used | length')
        REVIEWS=$(echo "$BODY" | jq -r '.review_needed | length')
        echo "   Fallbacks used: $FALLBACKS"
        echo "   Reviews needed: $REVIEWS"
    else
        echo "❌ Extraction failed (HTTP $HTTP_CODE)"
        echo "$BODY" | jq .
        exit 1
    fi
fi
echo ""

# Test invalid file (too large)
echo "5. Testing validation (oversized file)..."
dd if=/dev/zero of="${TEST_DIR}/large_file.bin" bs=1M count=11 2>/dev/null
RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/tokens/extract/screenshot" \
    -F "file=@${TEST_DIR}/large_file.bin" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "400" ]; then
    echo "✅ Oversized file correctly rejected"
else
    echo "❌ Oversized file validation failed"
fi
echo ""

# Test invalid format
echo "6. Testing validation (invalid format)..."
echo "not an image" > "${TEST_DIR}/test.txt"
RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/tokens/extract/screenshot" \
    -F "file=@${TEST_DIR}/test.txt" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "400" ]; then
    echo "✅ Invalid format correctly rejected"
else
    echo "❌ Invalid format validation failed"
fi
echo ""

# Cleanup
rm -rf "$TEST_DIR"

echo "=============================="
echo "🎉 All tests passed!"
echo ""
echo "API Documentation: ${API_URL}/docs"
