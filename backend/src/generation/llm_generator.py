"""
LLM Code Generator

Uses OpenAI to generate complete React/TypeScript component code.
Includes structured output, LangSmith tracing, and error handling.
"""

import json
import os
import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
import time

# Try to import OpenAI and LangSmith (optional dependencies)
try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from langsmith import traceable
    LANGSMITH_AVAILABLE = True
except ImportError:
    # Create a no-op decorator if LangSmith is not available
    def traceable(*args, **kwargs):
        def decorator(func):
            return func
        return decorator
    LANGSMITH_AVAILABLE = False


@dataclass
class LLMGeneratedCode:
    """Structured output from LLM generation."""
    component_code: str  # Complete .tsx file content
    stories_code: str  # Complete .stories.tsx content
    showcase_code: str  # Complete .showcase.tsx content for auto-preview
    imports: List[str]  # List of import statements
    exports: List[str]  # List of exported names
    explanation: str  # Why code was generated this way
    token_usage: Dict[str, int]  # Prompt/completion tokens used

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


class LLMComponentGenerator:
    """
    Generate React/TypeScript component code using OpenAI.
    
    Features:
    - Structured JSON output for reliable parsing
    - LangSmith tracing for observability
    - Automatic retries with exponential backoff
    - Token usage tracking
    - Comprehensive error handling
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "gpt-4o",
        max_retries: int = 3,
        timeout: int = 60,
    ):
        """
        Initialize LLM generator.
        
        Args:
            api_key: OpenAI API key (defaults to env var OPENAI_API_KEY)
            model: OpenAI model to use
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds
        """
        if not OPENAI_AVAILABLE:
            raise ImportError(
                "OpenAI package not installed. Install with: pip install openai"
            )
        
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key not provided")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = model
        self.max_retries = max_retries
        self.timeout = timeout
    
    @traceable(run_type="llm", name="llm_generate_component")
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
    ) -> LLMGeneratedCode:
        """
        Generate component code using OpenAI.
        
        Args:
            system_prompt: System prompt defining AI role
            user_prompt: User prompt with requirements
            temperature: Sampling temperature (0.0-1.0)
        
        Returns:
            LLMGeneratedCode with generated component and stories
        
        Raises:
            Exception: If generation fails after all retries
        """
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                # Calculate backoff delay
                if attempt > 0:
                    delay = 2 ** attempt  # Exponential backoff
                    await asyncio.sleep(delay)
                
                # Call OpenAI API with JSON mode
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"},
                    timeout=self.timeout,
                )
                
                # Extract response
                content = response.choices[0].message.content
                
                # Parse JSON response
                result = json.loads(content)

                # Debug logging for showcase field
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"LLM Response keys: {result.keys()}")
                logger.info(f"showcase_code present: {'showcase_code' in result}")
                logger.info(f"showcase_code length: {len(result.get('showcase_code', ''))}")

                # Validate required fields
                self._validate_response(result)
                
                # Extract token usage
                token_usage = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }
                
                # Create structured output
                return LLMGeneratedCode(
                    component_code=result.get("component_code", ""),
                    stories_code=result.get("stories_code", ""),
                    showcase_code=result.get("showcase_code", ""),
                    imports=result.get("imports", []),
                    exports=result.get("exports", []),
                    explanation=result.get("explanation", ""),
                    token_usage=token_usage,
                )
                
            except json.JSONDecodeError as e:
                last_error = f"Invalid JSON response: {str(e)}"
                continue
            
            except Exception as e:
                last_error = f"Generation error: {str(e)}"
                continue
        
        # All retries failed
        raise Exception(
            f"LLM generation failed after {self.max_retries} attempts. "
            f"Last error: {last_error}"
        )
    
    def _validate_response(self, response: Dict[str, Any]) -> None:
        """
        Validate that response has required fields.
        
        Args:
            response: JSON response from LLM
        
        Raises:
            ValueError: If required fields are missing
        """
        required_fields = ["component_code", "stories_code", "showcase_code"]

        for field in required_fields:
            if field not in response:
                raise ValueError(f"Missing required field: {field}")

            if not response[field] or not isinstance(response[field], str):
                raise ValueError(f"Invalid value for field: {field}")
    
    @traceable(run_type="tool", name="estimate_cost")
    def estimate_cost(self, token_usage: Dict[str, int]) -> float:
        """
        Estimate cost of API call based on token usage.
        
        Pricing for GPT-4 Turbo (as of 2024):
        - Input: $10 per 1M tokens
        - Output: $30 per 1M tokens
        
        Args:
            token_usage: Token usage dict with prompt/completion tokens
        
        Returns:
            Estimated cost in USD
        """
        prompt_tokens = token_usage.get("prompt_tokens", 0)
        completion_tokens = token_usage.get("completion_tokens", 0)
        
        # Cost per 1M tokens
        input_cost_per_m = 10.0
        output_cost_per_m = 30.0
        
        # Calculate cost
        input_cost = (prompt_tokens / 1_000_000) * input_cost_per_m
        output_cost = (completion_tokens / 1_000_000) * output_cost_per_m
        
        return input_cost + output_cost
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model configuration.
        
        Returns:
            Dict with model info
        """
        return {
            "model": self.model,
            "max_retries": self.max_retries,
            "timeout": self.timeout,
            "langsmith_enabled": LANGSMITH_AVAILABLE,
        }


class MockLLMGenerator(LLMComponentGenerator):
    """
    Mock LLM generator for testing without API calls.
    """
    
    def __init__(self):
        """Initialize mock generator without API key."""
        self.model = "mock-gpt-4"
        self.max_retries = 3
        self.timeout = 60
    
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
    ) -> LLMGeneratedCode:
        """
        Generate mock component code based on prompt content.
        
        Detects component type from prompt and returns appropriate mock.
        """
        # Detect component type from prompt
        user_prompt_lower = user_prompt.lower()
        
        # Check for specific pattern IDs first (most reliable)
        if "shadcn-card" in user_prompt_lower:
            return self._generate_mock_card()
        elif "shadcn-button" in user_prompt_lower:
            return self._generate_mock_button()
        elif "shadcn-input" in user_prompt_lower:
            return self._generate_mock_input()
        
        # Check for component names with more specific patterns
        # Look for component names in the prompt
        elif "component: button" in user_prompt_lower or "button component" in user_prompt_lower:
            return self._generate_mock_button()
        elif "component: card" in user_prompt_lower or "card component" in user_prompt_lower:
            return self._generate_mock_card()
        elif "component: input" in user_prompt_lower or "input component" in user_prompt_lower:
            return self._generate_mock_input()
        
        # Check for component names in the prompt (less specific but still useful)
        elif "input" in user_prompt_lower and ("component" in user_prompt_lower or "input" in user_prompt_lower):
            return self._generate_mock_input()
        elif "card" in user_prompt_lower and ("component" in user_prompt_lower or "card" in user_prompt_lower):
            return self._generate_mock_card()
        elif "button" in user_prompt_lower and ("component" in user_prompt_lower or "button" in user_prompt_lower):
            return self._generate_mock_button()
        else:
            # Default to button for unknown types
            return self._generate_mock_button()
    
    def _generate_mock_button(self) -> LLMGeneratedCode:
        """Generate mock button component."""
        return LLMGeneratedCode(
            component_code='''import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
}) => {
  return (
    <button
      className={`button button--${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

Button.displayName = 'Button';
''',
            stories_code='''import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};
''',
            showcase_code='''import { Button } from './Button';

export default function ButtonShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Button</h2>
        <p className="text-gray-600">Generated by Component Forge</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Primary</h3>
          <div className="p-4 bg-white rounded-lg border">
            <Button variant="primary">Click me</Button>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Secondary</h3>
          <div className="p-4 bg-white rounded-lg border">
            <Button variant="secondary">Click me</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
''',
            imports=[
                "import React from 'react';",
                "import type { Meta, StoryObj } from '@storybook/react';",
            ],
            exports=["Button"],
            explanation="Generated a basic button component with variants.",
            token_usage={
                "prompt_tokens": 500,
                "completion_tokens": 300,
                "total_tokens": 800,
            },
        )
    
    def _generate_mock_card(self) -> LLMGeneratedCode:
        """Generate mock card component."""
        return LLMGeneratedCode(
            component_code='''import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  variant = 'elevated',
}) => {
  return (
    <div className={`card card--${variant}`}>
      <h3 className="card__title">{title}</h3>
      <div className="card__content">{children}</div>
    </div>
  );
};

Card.displayName = 'Card';
''',
            stories_code='''import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    children: 'Card content goes here',
    variant: 'elevated',
  },
};
''',
            showcase_code='''import { Card } from './Card';

export default function CardShowcase() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Card</h2>
        <p className="text-gray-600">Generated by Component Forge</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Outlined</h3>
          <div className="p-4 bg-white rounded-lg border">
            <Card title="Card Title" variant="outlined">Card content</Card>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Elevated</h3>
          <div className="p-4 bg-white rounded-lg border">
            <Card title="Card Title" variant="elevated">Card content</Card>
          </div>
        </div>
      </div>
    </div>
  );
}
''',
            imports=["import React from 'react';"],
            exports=["Card"],
            explanation="Generated a card component with title and content sections.",
            token_usage={
                "prompt_tokens": 520,
                "completion_tokens": 320,
                "total_tokens": 840,
            },
        )
    
    def _generate_mock_input(self) -> LLMGeneratedCode:
        """Generate mock input component."""
        return LLMGeneratedCode(
            component_code='''import React from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className="input-wrapper">
      <label className="input__label">{label}</label>
      <input
        className="input__field"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

Input.displayName = 'Input';
''',
            stories_code='''import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email',
    value: '',
    onChange: () => {},
    placeholder: 'Enter email',
  },
};
''',
            showcase_code='''import { Input } from './Input';
import { useState } from 'react';

export default function InputShowcase() {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Input</h2>
        <p className="text-gray-600">Generated by Component Forge</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Default</h3>
          <div className="p-4 bg-white rounded-lg border">
            <Input label="Email" value={value} onChange={setValue} placeholder="Enter email" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Disabled</h3>
          <div className="p-4 bg-white rounded-lg border">
            <Input label="Email" value="" onChange={() => {}} disabled placeholder="Disabled" />
          </div>
        </div>
      </div>
    </div>
  );
}
''',
            imports=["import React from 'react';"],
            exports=["Input"],
            explanation="Generated an input component with label and form controls.",
            token_usage={
                "prompt_tokens": 510,
                "completion_tokens": 340,
                "total_tokens": 850,
            },
        )
