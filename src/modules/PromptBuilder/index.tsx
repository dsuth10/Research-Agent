import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppStore } from '@/store/app-store';
import { openaiService } from '@/services/openai-service';
import { generateId, calculateCost } from '@/utils/utils';
import Button from '@/components/Button';

const promptSchema = z.object({
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
  scope: z.string().min(5, 'Scope must be at least 5 characters'),
  constraints: z.string().optional(),
  depth: z.enum(['low', 'medium', 'high']),
  maxTokens: z.number().min(100).max(2000).optional(),
});

type PromptFormData = z.infer<typeof promptSchema>;

const TOKEN_COST = {
  'gpt-4.1': { input: 2.5, output: 10 },
  'o3-deep-research': { input: 10, output: 40 },
};

function PromptBuilder() {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenEstimate, setTokenEstimate] = useState(0);
  const [costEstimate, setCostEstimate] = useState(0);
  const { addResearch, setCurrentResearch, setUI, settings } = useAppStore();

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
    mode: 'onChange',
  });

  const watchedValues = watch();

  useEffect(() => {
    // Estimate tokens and cost in real time
    const tokens = watchedValues.maxTokens || 500;
    setTokenEstimate(tokens);
    setCostEstimate(
      calculateCost(tokens, 0, 'gpt-4.1')
    );
  }, [watchedValues.maxTokens]);

  const onGeneratePrompt = async (data: PromptFormData) => {
    if (!settings.openaiApiKey) {
      alert('Please set your OpenAI API key in settings');
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = await openaiService.generatePrompt({
        ...data,
        model: 'gpt-4.1',
        constraints: data.constraints || '',
      });
      setGeneratedPrompt(prompt);
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      alert('Failed to generate prompt. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const onStartResearch = () => {
    if (!generatedPrompt) {
      alert('Please generate a prompt first');
      return;
    }
    const research = {
      id: generateId(),
      title: watchedValues.goal.substring(0, 100),
      prompt: generatedPrompt,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    addResearch(research);
    setCurrentResearch(research);
    setUI({ currentTab: 'research' });
  };

  const copyToClipboard = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt);
    }
  };

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
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                <span>Token Estimate: {tokenEstimate}</span>
                <span className="ml-4">Cost Estimate: ${costEstimate.toFixed(4)}</span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!isValid || isGenerating || !settings.openaiApiKey}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
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
                  Copy
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
                    Start Research with this Prompt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <span className="text-2xl">✨</span>
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
  );
}

export default PromptBuilder; 