"use client"

/**
 * Demo page for Epic 4.5 Frontend Components
 * 
 * This page demonstrates the new ValidationErrorsDisplay and QualityScoresDisplay
 * components with mock data.
 */

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ValidationErrorsDisplay } from "@/components/preview/ValidationErrorsDisplay"
import { QualityScoresDisplay } from "@/components/preview/QualityScoresDisplay"
import { GenerationProgress } from "@/components/composite/GenerationProgress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GenerationStage,
  GenerationStatus,
  getFixAttemptsMessage,
} from "@/types"
import { RefreshCw, AlertCircle } from "lucide-react"

export default function Epic45DemoPage() {
  const [scenario, setScenario] = React.useState<'perfect' | 'fixed' | 'failed'>('perfect')

  const mockData = {
    perfect: {
      validationResults: {
        attempts: 0,
        final_status: 'passed' as const,
        typescript_passed: true,
        typescript_errors: [],
        eslint_passed: true,
        eslint_errors: [],
        eslint_warnings: [],
      },
      qualityScores: {
        compilation: true,
        linting: 100,
        type_safety: 100,
        overall: 98,
      },
    },
    fixed: {
      validationResults: {
        attempts: 2,
        final_status: 'passed' as const,
        typescript_passed: true,
        typescript_errors: [],
        eslint_passed: true,
        eslint_errors: [],
        eslint_warnings: [
          { line: 45, column: 12, message: 'Prefer using template literals', ruleId: 'prefer-template' },
          { line: 67, column: 5, message: 'Unexpected console statement', ruleId: 'no-console' },
        ],
      },
      qualityScores: { compilation: true, linting: 88, type_safety: 92, overall: 85 },
    },
    failed: {
      validationResults: {
        attempts: 2,
        final_status: 'failed' as const,
        typescript_passed: false,
        typescript_errors: [
          { line: 23, column: 8, message: "Type 'string' is not assignable to type 'number'", code: 'TS2322' },
          { line: 45, column: 15, message: "Property 'onClick' does not exist", code: 'TS2339' },
        ],
        eslint_passed: false,
        eslint_errors: [
          { line: 12, column: 3, message: "'React' must be in scope when using JSX", ruleId: 'react/react-in-jsx-scope' },
        ],
        eslint_warnings: [
          { line: 34, column: 20, message: 'Missing return type', ruleId: '@typescript-eslint/explicit-function-return-type' },
        ],
      },
      qualityScores: { compilation: false, linting: 65, type_safety: 72, overall: 58 },
    },
  }

  const currentData = mockData[scenario]

  return (
    <main className="container mx-auto p-4 sm:p-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Badge variant="warning" className="mb-2">Demo / Preview</Badge>
          <h1 className="text-3xl font-bold">Epic 4.5: Frontend Components Demo</h1>
          <p className="text-muted-foreground mt-2">Preview of new validation and quality components</p>
        </div>
        <Card className="border-blue-500/20 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Demonstration page for Epic 4.5 Task 11
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  These components will be integrated once backend Task 10 is complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Test Scenarios</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant={scenario === 'perfect' ? 'default' : 'outline'} onClick={() => setScenario('perfect')}>
            Perfect <Badge variant="success" className="ml-2">0 fixes</Badge>
          </Button>
          <Button variant={scenario === 'fixed' ? 'default' : 'outline'} onClick={() => setScenario('fixed')}>
            Fixed <Badge variant="warning" className="ml-2">2 fixes</Badge>
          </Button>
          <Button variant={scenario === 'failed' ? 'default' : 'outline'} onClick={() => setScenario('failed')}>
            Failed <Badge variant="error" className="ml-2">2 attempts</Badge>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Scenario: {scenario}</span>
            <Badge variant={scenario === 'perfect' ? 'success' : scenario === 'fixed' ? 'warning' : 'error'}>
              {currentData.validationResults.final_status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Fix attempts: <strong>{getFixAttemptsMessage(currentData.validationResults.attempts)}</strong>
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4 mt-4">
          <GenerationProgress
            currentStage={GenerationStage.COMPLETE}
            status={scenario === 'failed' ? GenerationStatus.FAILED : GenerationStatus.COMPLETED}
            elapsedMs={scenario === 'perfect' ? 18500 : 35200}
            error={scenario === 'failed' ? 'Validation failed after 2 attempts' : undefined}
            validationResults={currentData.validationResults}
            qualityScores={currentData.qualityScores}
          />
        </TabsContent>

        <TabsContent value="quality" className="space-y-4 mt-4">
          <QualityScoresDisplay qualityScores={currentData.qualityScores} />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4 mt-4">
          <ValidationErrorsDisplay validationResults={currentData.validationResults} />
        </TabsContent>
      </Tabs>

      <Card className="border-amber-500/20 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader><CardTitle className="text-sm">Implementation Notes</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs">
          <p><strong>Stages:</strong> 5 → 3 (GENERATING, VALIDATING, POST_PROCESSING)</p>
          <p><strong>Target:</strong> 60s → 30s</p>
          <p><strong>New:</strong> Validation results, quality scores, fix tracking</p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => {
          const scenarios: Array<'perfect' | 'fixed' | 'failed'> = ['perfect', 'fixed', 'failed']
          const idx = scenarios.indexOf(scenario)
          setScenario(scenarios[(idx + 1) % 3])
        }}>
          <RefreshCw className="mr-2 h-4 w-4" />Cycle Scenarios
        </Button>
      </div>
    </main>
  )
}
