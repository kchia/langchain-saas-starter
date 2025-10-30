#!/bin/bash
# Script to create test image fixtures for E2E tests

echo "Creating test image fixtures..."

# Create a valid small PNG (1x1 transparent pixel - base64 encoded)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > valid-1x1.png

# Create a 600x400 valid screenshot (using ImageMagick if available)
if command -v convert &> /dev/null; then
    convert -size 600x400 xc:white \
        -pointsize 24 -draw "text 50,50 'Design System'" \
        -pointsize 16 -draw "text 50,100 'Primary: #3B82F6'" \
        -pointsize 16 -draw "text 50,130 'Secondary: #64748B'" \
        -pointsize 16 -draw "text 50,160 'Accent: #F59E0B'" \
        valid-screenshot.png
    
    # Create low-res version (300x200)
    convert valid-screenshot.png -resize 300x200 low-res-screenshot.png
    
    echo "✓ Created PNG fixtures with ImageMagick"
else
    echo "⚠ ImageMagick not available. Using minimal 1x1 PNG for valid-screenshot.png"
    cp valid-1x1.png valid-screenshot.png
    cp valid-1x1.png low-res-screenshot.png
fi

echo "✓ Created test fixtures in $(pwd)"
echo ""
echo "Fixtures created:"
ls -lh *.png *.svg *.txt 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
