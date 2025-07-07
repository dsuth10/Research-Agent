# Create the Prompt Builder module components

# Prompt Builder main component
prompt_builder_component = '''import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/store/app-store'
import { openaiService } from '@/lib/api/openai-service'
import { generateId } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Sparkles, Copy, Save, Play } from 'lucide-react'
import type { PromptConfig } from '@/lib/types'

const promptSchema = z.object({
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
  scope: z.string().min(5, 'Scope must be at least 5 characters'),
  constraints: z.string().optional(),
  depth: z.enum(['low', 'medium', 'high']),
  maxTokens: z.number().min(100).max(2000).optional(),
})

type PromptFormData = z.infer<typeof promptSchema>

export default function PromptBuilder() {
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { addResearch, setCurrentResearch, setUI, settings } = useAppStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      depth: 'medium',
      maxTokens: 500,
    },
  })
  
  const watchedValues = watch()
  
  const onGeneratePrompt = async (data: PromptFormData) => {
    if (!settings.openaiApiKey) {
      alert('Please set your OpenAI API key in settings')
      return
    }
    
    setIsGenerating(true)
    try {
      const prompt = await openaiService.generatePrompt(data as PromptConfig)
      setGeneratedPrompt(prompt)
    } catch (error) {
      console.error('Failed to generate prompt:', error)
      alert('Failed to generate prompt. Please check your API key and try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const onStartResearch = () => {
    if (!generatedPrompt) {
      alert('Please generate a prompt first')
      return
    }
    
    const research = {
      id: generateId(),
      title: watchedValues.goal.substring(0, 100),
      prompt: generatedPrompt,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }
    
    addResearch(research)
    setCurrentResearch(research)
    setUI({ currentTab: 'research' })
  }
  
  const copyToClipboard = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt)
      // Could add a toast notification here
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prompt Builder</h1>
        <p className="text-muted-foreground mt-2">
          Create optimized research prompts using GPT-4.1 for better Deep Research results
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onGeneratePrompt)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Research Goal *
              </label>
              <textarea
                {...register('goal')}
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
                placeholder="Describe what you want to research..."
              />
              {errors.goal && (
                <p className="text-sm text-destructive mt-1">{errors.goal.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Scope & Context *
              </label>
              <textarea
                {...register('scope')}
                className="w-full p-3 border rounded-md resize-none"
                rows={2}
                placeholder="Define the scope, timeframe, or specific context..."
              />
              {errors.scope && (
                <p className="text-sm text-destructive mt-1">{errors.scope.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Constraints & Requirements
              </label>
              <textarea
                {...register('constraints')}
                className="w-full p-3 border rounded-md resize-none"
                rows={2}
                placeholder="Any specific requirements, constraints, or preferences..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Research Depth
                </label>
                <select
                  {...register('depth')}
                  className="w-full p-3 border rounded-md"
                >
                  <option value="low">Low - Quick overview</option>
                  <option value="medium">Medium - Balanced analysis</option>
                  <option value="high">High - Comprehensive deep dive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Prompt Length (tokens)
                </label>
                <input
                  {...register('maxTokens', { valueAsNumber: true })}
                  type="number"
                  min="100"
                  max="2000"
                  className="w-full p-3 border rounded-md"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={!isValid || isGenerating || !settings.openaiApiKey}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Optimized Prompt
                </>
              )}
            </Button>
          </form>
        </div>
        
        {/* Generated Prompt Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Prompt</h3>
            {generatedPrompt && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="border rounded-md p-4 min-h-[300px] bg-muted/50">
            {generatedPrompt ? (
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedPrompt}
                </pre>
                <div className="pt-4 border-t">
                  <Button onClick={onStartResearch} className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Start Research with this Prompt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Your optimized prompt will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Tips for Better Prompts
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Be specific about what you want to learn or discover</li>
          <li>• Include relevant timeframes or geographical constraints</li>
          <li>• Mention the type of sources you prefer (academic, news, etc.)</li>
          <li>• Specify the intended audience or use case for the research</li>
        </ul>
      </div>
    </div>
  )
}'''

# Agent Runner component for executing research
agent_runner_component = '''import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { openaiService } from '@/lib/api/openai-service'
import { calculateCost, formatTokenCount } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Play, Square, RotateCcw, ChevronRight } from 'lucide-react'

export default function AgentRunner() {
  const { currentResearch, updateResearch, setUI } = useAppStore()
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<string[]>([])
  const [currentStream, setCurrentStream] = useState<ReadableStream<string> | null>(null)
  
  useEffect(() => {
    // Auto-start if research is pending
    if (currentResearch?.status === 'pending') {
      startResearch()
    }
  }, [currentResearch])
  
  const startResearch = async () => {
    if (!currentResearch || !currentResearch.prompt) return
    
    setIsRunning(true)
    setProgress(['Starting research...'])
    
    try {
      updateResearch(currentResearch.id, { status: 'running' })
      
      const { responseId, stream } = await openaiService.runDeepResearch(currentResearch.prompt)
      setCurrentStream(stream)
      
      const reader = stream.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        try {
          const data = JSON.parse(value)
          
          if (data.status === 'completed') {
            const result = await openaiService.getResearchResult(responseId)
            
            // Process the result
            const reportText = result.output[0]?.content[0]?.text || ''
            const usage = result.usage
            
            const researchResult = {
              report: reportText,
              thoughtProcess: '', // Could extract from reasoning if available
              sources: [], // Would need to parse from the report
              reasoning: result.reasoning,
            }
            
            const cost = calculateCost(
              usage.input_tokens,
              usage.output_tokens,
              'o3-deep-research'
            )
            
            updateResearch(currentResearch.id, {
              status: 'completed',
              completedAt: new Date().toISOString(),
              result: researchResult,
              cost: {
                inputTokens: usage.input_tokens,
                outputTokens: usage.output_tokens,
                totalCost: cost,
              },
            })
            
            setProgress(prev => [...prev, 'Research completed!'])
            setIsRunning(false)
            
            // Auto-navigate to results
            setTimeout(() => {
              setUI({ currentTab: 'results' })
            }, 1000)
            
            break
          } else if (data.status === 'running') {
            setProgress(prev => [...prev, `Research in progress... (ID: ${data.id})`])
          }
        } catch (parseError) {
          console.warn('Failed to parse progress update:', value)
        }
      }
    } catch (error) {
      console.error('Research failed:', error)
      updateResearch(currentResearch.id, { 
        status: 'error',
        completedAt: new Date().toISOString(),
      })
      setProgress(prev => [...prev, `Error: ${error.message}`])
      setIsRunning(false)
    }
  }
  
  const stopResearch = () => {
    if (currentStream) {
      currentStream.cancel()
      setCurrentStream(null)
    }
    setIsRunning(false)
    if (currentResearch) {
      updateResearch(currentResearch.id, { status: 'error' })
    }
  }
  
  const resetResearch = () => {
    if (currentResearch) {
      updateResearch(currentResearch.id, { status: 'pending' })
      setProgress([])
      setIsRunning(false)
    }
  }
  
  if (!currentResearch) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Agent Runner</h1>
          <p className="text-muted-foreground mb-6">
            No research task selected. Create a prompt first.
          </p>
          <Button onClick={() => setUI({ currentTab: 'prompt' })}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Go to Prompt Builder
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Research Agent</h1>
        <p className="text-muted-foreground mt-2">
          Running deep research with OpenAI's o3 model
        </p>
      </div>
      
      {/* Research Task Info */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-3">Current Research Task</h3>
        <div className="space-y-2">
          <p><strong>Title:</strong> {currentResearch.title}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs status-${currentResearch.status}`}>
              {currentResearch.status.toUpperCase()}
            </span>
          </p>
          <p><strong>Created:</strong> {new Date(currentResearch.createdAt).toLocaleString()}</p>
          {currentResearch.cost && (
            <p><strong>Cost:</strong> ${currentResearch.cost.totalCost.toFixed(4)} 
              ({formatTokenCount(currentResearch.cost.inputTokens)} input + {formatTokenCount(currentResearch.cost.outputTokens)} output tokens)
            </p>
          )}
        </div>
        
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">View Prompt</summary>
          <pre className="mt-2 p-3 bg-muted rounded text-sm whitespace-pre-wrap">
            {currentResearch.prompt}
          </pre>
        </details>
      </div>
      
      {/* Controls */}
      <div className="flex gap-3">
        {currentResearch.status === 'pending' && !isRunning && (
          <Button onClick={startResearch}>
            <Play className="mr-2 h-4 w-4" />
            Start Research
          </Button>
        )}
        
        {isRunning && (
          <Button onClick={stopResearch} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            Stop Research
          </Button>
        )}
        
        {currentResearch.status === 'error' && (
          <Button onClick={resetResearch} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
        
        {currentResearch.status === 'completed' && (
          <Button onClick={() => setUI({ currentTab: 'results' })}>
            <ChevronRight className="mr-2 h-4 w-4" />
            View Results
          </Button>
        )}
      </div>
      
      {/* Progress Log */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="font-semibold mb-3">Research Progress</h3>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm min-h-[200px] max-h-[400px] overflow-y-auto">
          {progress.map((line, index) => (
            <div key={index} className="flex">
              <span className="text-green-600 mr-2">$</span>
              <span>{line}</span>
            </div>
          ))}
          {isRunning && (
            <div className="flex">
              <span className="text-green-600 mr-2">$</span>
              <span className="animate-pulse">Running deep research analysis...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Model Information */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          🤖 About the Research Model
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• Using <strong>o3-deep-research-2025-06-26</strong> model</p>
          <p>• Pricing: $10/1M input tokens, $40/1M output tokens</p>
          <p>• Supports web search, code execution, and multi-step reasoning</p>
          <p>• Research tasks typically take 2-15 minutes depending on complexity</p>
        </div>
      </div>
    </div>
  )
}'''

# Create the module components
module_files = {
    "src/modules/prompt-builder/components/PromptBuilder.tsx": prompt_builder_component,
    "src/modules/agent-runner/components/AgentRunner.tsx": agent_runner_component,
}

for filepath, content in module_files.items():
    # Create directory if it doesn't exist
    directory = "/".join(filepath.split("/")[:-1])
    os.makedirs(directory, exist_ok=True)
    
    with open(filepath, "w") as f:
        f.write(content)

print("MODULE COMPONENTS CREATED")
print("=" * 50)
for filepath in module_files.keys():
    print(f"✓ {filepath}")

print("\nMODULE FEATURES:")
print("• Prompt Builder with form validation using Zod")
print("• Real-time prompt generation with GPT-4.1")
print("• Agent Runner with streaming progress updates")
print("• Comprehensive error handling and user feedback")
print("• Token usage tracking and cost calculation")
print("• Status management and state persistence")
print("• Responsive design with loading states")
print("• Integration with the global Zustand store")
print("• TypeScript interfaces for type safety")
print("• Modern React patterns with hooks")