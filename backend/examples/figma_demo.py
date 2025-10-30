#!/usr/bin/env python3
"""
Example usage script for Figma integration.

This script demonstrates how to use the Figma client to:
1. Validate a Figma PAT
2. Extract design tokens from a Figma file
3. Get cache metrics

Requirements:
- Redis running on localhost:6379
- FIGMA_PAT environment variable set
"""

import asyncio
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.services.figma_client import FigmaClient


async def main():
    """Demonstrate Figma integration usage."""
    
    # Check if FIGMA_PAT is set
    if not os.getenv("FIGMA_PAT"):
        print("⚠️  FIGMA_PAT environment variable not set")
        print("Set it in .env file or export FIGMA_PAT=your_token")
        return
    
    print("🚀 Figma Integration Demo\n")
    
    # Initialize client
    async with FigmaClient() as client:
        # 1. Validate token
        print("1️⃣  Validating Figma PAT...")
        try:
            user_data = await client.validate_token()
            print(f"   ✅ Authenticated as: {user_data.get('email', 'Unknown')}")
        except Exception as e:
            print(f"   ❌ Authentication failed: {e}")
            return
        
        # 2. Extract file key from URL (example)
        figma_url = "https://figma.com/file/abc123xyz/Example-Design-System"
        print(f"\n2️⃣  Extracting file key from URL...")
        try:
            file_key = FigmaClient.extract_file_key(figma_url)
            print(f"   ✅ File key: {file_key}")
        except ValueError as e:
            print(f"   ❌ Invalid URL: {e}")
        
        print("\n✨ Demo complete!")
        print("\n💡 Tips:")
        print("   - Set FIGMA_PAT in .env file")
        print("   - Check backend/docs/FIGMA_INTEGRATION.md for full docs")


if __name__ == "__main__":
    asyncio.run(main())
