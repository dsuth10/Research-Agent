import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { aiService } from '@/services/ai-service';
import Button from '@/components/Button';
import Card from '@/components/Card';
import type { DeepResearchPromptConfig } from '@/types/types';

// TODO: Implement task execution, streaming updates, and cost tracking
const AgentRunner = () => {
  const { currentResearch, updateResearch, setUI } = useAppStore();
  const [progress, setProgress] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('');
  const streamRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Helper to determine if model is o3/o4 (Deep Research)
  const isDeepResearchModel = (model: string) => /o3|o4/i.test(model);

  // Helper to build OpenRouter-compatible payload
  const buildPayload = (cfg: any) => {
    if (isDeepResearchModel(cfg.model)) {
      return {
        model: cfg.model,
        input: [
          { role: 'system', content: cfg.systemPrompt || '' },
          { role: 'user', content: cfg.userPrompt }
        ],
        max_tokens: cfg.maxTokens,
        // tools: cfg.tools, // Uncomment if you ever add o3/o4 support again
        // background: cfg.background, // Uncomment if you ever add o3/o4 support again
      };
    } else {
      return {
        model: cfg.model,
        input: [
          { role: 'system', content: cfg.systemPrompt || '' },
          { role: 'user', content: cfg.userPrompt }
        ],
        max_tokens: cfg.maxTokens,
      };
    }
  };

  // Start research task if needed
  useEffect(() => {
    let cancelled = false;
    const runResearch = async () => {
      if (!currentResearch) return;
      setProgress('running');
      setError(null);
      try {
        let responseId = currentResearch.responseId;
        let stream: ReadableStream<string> | null = null;
        if (currentResearch.status === 'pending') {
          setStatusText('Starting research...');
          updateResearch(currentResearch.id, { status: 'running' });
          const rawConfig = JSON.parse(currentResearch.prompt);
          const payload = buildPayload(rawConfig);
          const res = await aiService.runDeepResearch(payload);
          responseId = res.responseId;
          stream = res.stream;
          updateResearch(currentResearch.id, { responseId, status: 'running' });
        } else if (responseId) {
          setStatusText('Resuming research...');
          stream = aiService.createProgressStream(responseId);
        } else {
          return;
        }
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
              const result = await aiService.getResearchResult(responseId);
              updateResearch(currentResearch.id, {
                status: 'completed',
                completedAt: new Date().toISOString(),
                result: {
                  report: result,
                  thoughtProcess: '', // To be filled if available
                  sources: [], // To be filled if available
                },
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
    if (
      currentResearch &&
      (currentResearch.status === 'pending' ||
        (currentResearch.status === 'running' && currentResearch.responseId && !currentResearch.result))
    ) {
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
    </Card>
  );
};

export { AgentRunner };
export default AgentRunner; 