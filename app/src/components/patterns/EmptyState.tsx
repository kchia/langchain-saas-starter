/**
 * EmptyState component shows message when no patterns are found
 * Suggests next steps for users
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface EmptyStateProps {
  onBack?: () => void;
}

export function EmptyState({ onBack }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Patterns Found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't find any patterns matching your requirements.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <p className="text-sm text-muted-foreground">Try the following:</p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Adjust your component requirements</li>
              <li>• Try different variants or properties</li>
              <li>• Simplify accessibility requirements</li>
              <li>• Check if your component type is supported</li>
            </ul>
          </div>
          
          <div className="flex justify-center gap-2 pt-4">
            {onBack ? (
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Adjust Requirements
              </Button>
            ) : (
              <Button variant="outline" asChild className="gap-2">
                <Link href="/requirements">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Requirements
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
