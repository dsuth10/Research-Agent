import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Select from '@/components/Select';
import { useAppStore } from '@/store/app-store';
import { calculateCost, generateId } from '@/utils/utils';
import { fetchOpenRouterModels } from '@/services/openrouter-service';

const SIDEBAR_STEPS = [
  { id: 0, label: 'Query & Prompt' },
  { id: 1, label: 'Model & Tokens' },
  { id: 2, label: 'Tools' },
  { id: 3, label: 'Advanced' },
  { id: 4, label: 'Preview JSON' },
];

// Define OpenRouter-compatible config and tool types
interface OpenRouterTool {
  type: 'web_search_preview';
}
interface OpenRouterPromptConfig {
  userPrompt: string;
  systemPrompt?: string;
  model: string;
  maxTokens: number;
  tools: OpenRouterTool[];
  background?: boolean;
}

const BASE_CONFIG: OpenRouterPromptConfig = {
  userPrompt: '',
  systemPrompt: '',
  model: '',
  maxTokens: 2000,
  tools: [{ type: 'web_search_preview' }],
  background: true,
};

// Helper to determine if model is o3/o4 (Deep Research)
const isDeepResearchModel = (model: string) => /o3|o4/i.test(model);

function PromptBuilder() {
  const { addResearch, setCurrentResearch, setUI, settings } = useAppStore();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<OpenRouterPromptConfig>({
    ...BASE_CONFIG,
    model: settings.researchModel,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jsonCopied, setJsonCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: routerModels } = useQuery({
    queryKey: ['openrouter-models', settings.openrouterApiKey],
    queryFn: () => fetchOpenRouterModels(settings.openrouterApiKey),
    enabled: !!settings.openrouterApiKey,
  });

  // Step navigation
  const goToStep = (idx: number) => setStep(idx);

  // Split validateStep into pure and impure versions
  const pureValidateStep = (stepIdx: number): boolean => {
    if (stepIdx === 0) {
      return !!config.userPrompt && config.userPrompt.length >= 10;
    }
    if (stepIdx === 1) {
      return !!config.model && !!config.maxTokens && config.maxTokens >= 100;
    }
    if (stepIdx === 2) {
      if (!config.tools || config.tools.length === 0) return false;
      for (const tool of config.tools) {
        if (tool.type === 'web_search_preview') return true;
      }
      return false;
    }
    return true;
  };
  const setStepErrors = (stepIdx: number) => {
    const newErrors: Record<string, string> = {};
    if (stepIdx === 0) {
      if (!config.userPrompt || config.userPrompt.length < 10) newErrors.userPrompt = 'User prompt is required (min 10 chars)';
    }
    if (stepIdx === 1) {
      if (!config.model) newErrors.model = 'Model is required';
      if (!config.maxTokens || config.maxTokens < 100) newErrors.maxTokens = 'Max tokens must be at least 100';
    }
    if (stepIdx === 2) {
      if (!config.tools || config.tools.length === 0) newErrors.tools = 'Select at least one tool (required by OpenRouter models)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cost estimator
  const tokenEstimate = config.maxTokens || 2000;
  const modelKey = typeof config.model === 'string' && config.model.startsWith('o4') ? 'o3-deep-research' : 'o3-deep-research'; // Use o3 pricing for both for now
  const cost = useMemo(() => calculateCost(tokenEstimate, 0, modelKey), [tokenEstimate, modelKey]);

  // Handle field changes
  const updateConfig = (patch: Partial<OpenRouterPromptConfig>) => setConfig(prev => ({ ...prev, ...patch }));

  // Handle tool array changes (only web_search_preview supported)
  const addTool = (tool: OpenRouterTool) => setConfig(prev => ({ ...prev, tools: [...prev.tools, tool] }));
  const removeTool = (idx: number) => setConfig(prev => ({ ...prev, tools: prev.tools.filter((_, i) => i !== idx) }));

  // In handleRun and previewPayload, construct payload based on model type
  const buildPayload = (cfg: OpenRouterPromptConfig) => {
    if (isDeepResearchModel(cfg.model)) {
      // For o3/o4 models, include tools/background if needed (not used here, but left for future)
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
      // For non-o3/o4 models, only include model, input, max_tokens
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

  // Handle Run
  const handleRun = async () => {
    if (!setStepErrors(0) || !setStepErrors(1) || !setStepErrors(2)) {
      setStep([0, 1, 2].find(idx => !pureValidateStep(idx))!);
      return;
    }
    setIsRunning(true);
    try {
      const payload = buildPayload(config);
      const research = {
        id: generateId(),
        title: config.userPrompt.substring(0, 100),
        prompt: JSON.stringify(payload, null, 2),
        status: 'pending' as const,
        responseId: undefined,
        createdAt: new Date().toISOString(),
      };
      addResearch(research);
      setCurrentResearch(research);
      setUI({ currentTab: 'research' });
    } catch (e) {
      alert('Failed to start research: ' + (e as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  // Responsive sidebar collapse
  React.useEffect(() => {
    const handleResize = () => {
      const shouldBeOpen = window.innerWidth > 768;
      setSidebarOpen(prev => {
        if (prev !== shouldBeOpen) return shouldBeOpen;
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // JSON preview
  const previewPayload = buildPayload(config);
  const previewJson = JSON.stringify(previewPayload, null, 2);

  // UI for each step
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="userPrompt" className="block text-sm font-medium mb-2">User Prompt *</label>
              <Textarea
                id="userPrompt"
                value={config.userPrompt}
                onChange={e => updateConfig({ userPrompt: e.target.value })}
                rows={3}
                maxLength={2000}
                placeholder="What do you want to research?"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{config.userPrompt.length}/2000</span>
                {errors.userPrompt && <span className="text-destructive">{errors.userPrompt}</span>}
              </div>
            </div>
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium mb-2">(Optional) System Instructions</label>
              <Textarea
                id="systemPrompt"
                value={config.systemPrompt}
                onChange={e => updateConfig({ systemPrompt: e.target.value })}
                rows={2}
                maxLength={1000}
                placeholder="System-level instructions for the research agent..."
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{config.systemPrompt?.length || 0}/1000</span>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="model" className="block text-sm font-medium mb-2">Model *</label>
              <Select
                id="model"
                value={config.model}
                onChange={e => updateConfig({ model: e.target.value as any })}
              >
                {routerModels && routerModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
              {errors.model && <div className="text-xs text-destructive">{errors.model}</div>}
            </div>
            <div>
              <label htmlFor="maxTokens" className="block text-sm font-medium mb-2">Max Output Tokens *</label>
              <Input
                id="maxTokens"
                type="number"
                min={100}
                max={typeof config.model === 'string' && config.model.includes('o4-mini') ? 64000 : 128000}
                value={config.maxTokens}
                onChange={e => updateConfig({ maxTokens: Number(e.target.value) })}
              />
              <div className="text-xs text-muted-foreground mt-1">Hard ceiling—cost ∝ length</div>
              {errors.maxTokens && <div className="text-xs text-destructive">{errors.maxTokens}</div>}
            </div>
            <div className="mt-2">
              <div className="w-full bg-accent h-2 rounded">
                <div
                  className="bg-primary h-2 rounded"
                  style={{ width: `${Math.min(100, (config.maxTokens / ((typeof config.model === 'string' && config.model.includes('o4-mini')) ? 64000 : 128000)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Context used: {config.maxTokens}</span>
                <span>Limit: {(typeof config.model === 'string' && config.model.includes('o4-mini')) ? '64,000' : '128,000'}</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* Remove: 'Enable Web Search Preview' checkbox and logic from case 2 in renderStep */}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {/* Remove: 'Run asynchronously' checkbox and logic from case 3 in renderStep */}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview JSON</h3>
              <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(previewJson); setJsonCopied(true); setTimeout(() => setJsonCopied(false), 1200); }}>
                {jsonCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="bg-muted/50 border rounded-md p-4 text-xs overflow-x-auto max-h-96 whitespace-pre-wrap">{previewJson}</pre>
          </div>
        );
      default:
        return null;
    }
  };

  // Sticky Run button and cost estimator
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      {sidebarOpen ? (
        <aside className="w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-2">
            {SIDEBAR_STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg ${step === idx ? 'bg-primary/10 font-bold' : 'hover:bg-accent/50 opacity-80'}`}
                onClick={() => goToStep(idx)}
              >
                <span className={`h-3 w-3 rounded-full ${step === idx ? 'bg-primary' : 'bg-accent'}`} />
                {s.label}
                {errors[s.label.toLowerCase().replace(/\s/g, '')] && <span className="text-destructive ml-2">!</span>}
              </div>
            ))}
          </nav>
        </aside>
      ) : null}
      {/* Main panel */}
      <main className="flex-1">
        <Card className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Deep Research Job Config</h1>
          </div>
          <div className="mb-6">
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Step {step + 1} of {SIDEBAR_STEPS.length}</span>
              <div className="flex-1" />
              {step > 0 && <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
              {step < SIDEBAR_STEPS.length - 1 && (
                <Button size="sm" onClick={() => {
                  if (pureValidateStep(step)) {
                    setStep(step + 1);
                  } else {
                    setStepErrors(step);
                  }
                }}>Next</Button>
              )}
            </div>
          </div>
          {renderStep()}
        </Card>
        {/* Sticky Run button and cost estimator */}
        <div className="fixed bottom-0 left-0 w-full bg-background border-t p-4 flex flex-col md:flex-row items-center gap-4 z-50">
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
            <Button
              className="w-full md:w-auto"
              onClick={handleRun}
              disabled={isRunning || !pureValidateStep(0) || !pureValidateStep(1) || !pureValidateStep(2)}
            >
              {isRunning ? 'Running...' : 'Run ▶'}
            </Button>
            <div className="text-xs text-muted-foreground ml-4">Cost estimate: ~AUD ${cost.toFixed(4)}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PromptBuilder; 