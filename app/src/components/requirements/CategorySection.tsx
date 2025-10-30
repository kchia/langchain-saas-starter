/**
 * CategorySection component groups requirements by category
 * with collapsible accordion functionality.
 */

'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { RequirementCategory } from '@/types/requirement.types';

interface CategorySectionProps {
  category: RequirementCategory;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// Category metadata
const categoryInfo: Record<
  RequirementCategory,
  { title: string; icon: string; description: string }
> = {
  [RequirementCategory.PROPS]: {
    title: 'Props',
    icon: '⚙️',
    description: 'Component properties and variants',
  },
  [RequirementCategory.EVENTS]: {
    title: 'Events',
    icon: '⚡',
    description: 'Event handlers and interactions',
  },
  [RequirementCategory.STATES]: {
    title: 'States',
    icon: '🔄',
    description: 'Visual states and variations',
  },
  [RequirementCategory.ACCESSIBILITY]: {
    title: 'Accessibility',
    icon: '♿',
    description: 'ARIA attributes and keyboard navigation',
  },
};

export function CategorySection({
  category,
  count,
  children,
  defaultOpen = false,
}: CategorySectionProps) {
  const info = categoryInfo[category];

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? 'item-1' : undefined}>
      <AccordionItem value="item-1" className="border rounded-lg">
        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
          <div className="flex items-center gap-3 w-full">
            <span className="text-2xl">{info.icon}</span>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{info.title}</h3>
                <Badge variant="neutral">{count}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{info.description}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
          <div className="space-y-4 mt-2">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
