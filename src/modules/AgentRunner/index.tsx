import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { openaiService } from '@/services/openai-service';
import Button from '@/components/Button';
import Card from '@/components/Card';

// TODO: Implement task execution, streaming updates, and cost tracking
const AgentRunner = () => {
  const { currentResearch, updateResearch, setUI } = useAppStore();
  const [progress, setProgress] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<{ inputTokens: number; outputTokens: number; totalCost: number }>({ inputTokens: 0, outputTokens: 0, totalCost: 0 });
  const [statusText, setStatusText] = useState('');
  const streamRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Helper to calculate cost from tokens
  const calculateCost = (input: number, output: number) => {
    // o3-deep-research: $10/1M input, $40/1M output tokens
    return {
      inputTokens: input,
      outputTokens: output,
      totalCost: (input / 1_000_000) * 10 + (output / 1_000_000) * 40,
    };
  };

  // Start research task if needed
  useEffect(() => {
    let cancelled = false;
    const runResearch = async () => {
      if (!currentResearch || currentResearch.status !== 'pending') return;
      setProgress('running');
      setStatusText('Starting research...');
      setError(null);
      try {
        updateResearch(currentResearch.id, { status: 'running' });
        const { stream, responseId } = await openaiService.runDeepResearch(currentResearch.prompt);
        const reader = stream.getReader();
        streamRef.current = reader;
        let done = false;
        while (!done && !cancelled) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const data = JSON.parse(value);
            if (data.status === 'running') {
              setStatusText('Research in progress...');
            } else if (data.status === 'completed') {
              setStatusText('Research complete!');
              // Fetch final result
              const result = await openaiService.getResearchResult(responseId);
              const costObj = calculateCost(result.usage.input_tokens, result.usage.output_tokens);
              setCost(costObj);
              updateResearch(currentResearch.id, {
                status: 'completed',
                completedAt: new Date().toISOString(),
                result: {
                  report: result.output?.[0]?.content?.[0]?.text || '',
                  thoughtProcess: '', // To be filled if available
                  sources: [], // To be filled if available
                },
                cost: costObj,
              });
              setProgress('completed');
              setTimeout(() => setUI({ currentTab: 'results' }), 1000);
              return;
            } else if (data.status === 'failed') {
              setProgress('error');
              setError('Research failed.');
              updateResearch(currentResearch.id, { status: 'error' });
              return;
            }
          }
        }
      } catch (err: any) {
        setProgress('error');
        setError(err?.message || 'Unknown error');
        updateResearch(currentResearch.id, { status: 'error' });
      }
    };
    if (currentResearch && currentResearch.status === 'pending') {
      runResearch();
    }
    return () => {
      cancelled = true;
      if (streamRef.current) {
        try { streamRef.current.cancel(); } catch {}
      }
    };
    // eslint-disable-next-line
  }, [currentResearch]);

  const handleRetry = () => {
    if (currentResearch) {
      updateResearch(currentResearch.id, { status: 'pending' });
      setProgress('idle');
      setError(null);
      setStatusText('');
    }
  };

  if (!currentResearch) {
    return <div className="p-4">No research task selected.</div>;
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-2">Agent Runner</h2>
      <div className="mb-2">
        <div className="font-medium">Prompt:</div>
        <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">{currentResearch.prompt}</div>
      </div>
      <div className="flex items-center gap-4">
        {progress === 'running' && <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-400" />}
        <span className="text-sm">{statusText || (currentResearch.status === 'completed' ? 'Completed' : 'Idle')}</span>
      </div>
      {progress === 'completed' && (
        <div className="text-green-500 text-sm">Research complete! Redirecting to results...</div>
      )}
      {progress === 'error' && (
        <div className="text-destructive text-sm">{error} <Button onClick={handleRetry} size="sm">Retry</Button></div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">
        <div>Input Tokens: {cost.inputTokens}</div>
        <div>Output Tokens: {cost.outputTokens}</div>
        <div>Total Cost: ${cost.totalCost.toFixed(4)}</div>
      </div>
    </Card>
  );
};

export { AgentRunner };
export default AgentRunner; 