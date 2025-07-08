import React, { useState, useMemo } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Select from '@/components/Select';
import { useAppStore } from '@/store/app-store';
import { calculateCost, generateId } from '@/utils/utils';
import type { DeepResearchPromptConfig, DeepResearchTool } from '@/types/types';

const SIDEBAR_STEPS = [
  { id: 0, label: 'Query & Prompt' },
  { id: 1, label: 'Model & Tokens' },
  { id: 2, label: 'Tools' },
  { id: 3, label: 'Advanced' },
  { id: 4, label: 'Preview JSON' },
];

const DEFAULT_CONFIG: DeepResearchPromptConfig = {
  userPrompt: '',
  systemPrompt: '',
  model: 'o3-deep-research-2025-06-26',
  maxTokens: 2000,
  tools: [{ type: 'web_search_preview', search_context_size: 'medium' }],
  reasoning: { summary: 'auto', effort: 'medium' },
  background: true,
};

function PromptBuilder() {
  const { addResearch, setCurrentResearch, setUI } = useAppStore();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<DeepResearchPromptConfig>(DEFAULT_CONFIG);
  const [toolChoiceOverride, setToolChoiceOverride] = useState<'auto' | 'web_search_preview' | 'mcp'>('auto');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [savePreset, setSavePreset] = useState(false);
  const [citationsToggle, setCitationsToggle] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jsonCopied, setJsonCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        if (tool.type === 'mcp') {
          if (!tool.server_label || !tool.server_url) return false;
        }
      }
      return true;
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
      if (!config.tools || config.tools.length === 0) newErrors.tools = 'Select at least one tool (required by Deep Research models)';
      for (const tool of config.tools) {
        if (tool.type === 'mcp') {
          if (!tool.server_label) newErrors.server_label = 'MCP server label required';
          if (!tool.server_url) newErrors.server_url = 'MCP server URL required';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cost estimator
  const tokenEstimate = config.maxTokens || 2000;
  const modelKey = config.model.startsWith('o4') ? 'o3-deep-research' : 'o3-deep-research'; // Use o3 pricing for both for now
  const cost = useMemo(() => calculateCost(tokenEstimate, 0, modelKey), [tokenEstimate, modelKey]);

  // Handle field changes
  const updateConfig = (patch: Partial<DeepResearchPromptConfig>) => setConfig(prev => ({ ...prev, ...patch }));

  // Handle tool array changes
  const updateTool = (idx: number, patch: Partial<DeepResearchTool>) => {
    setConfig(prev => ({
      ...prev,
      tools: prev.tools.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    }));
  };
  const addTool = (tool: DeepResearchTool) => setConfig(prev => ({ ...prev, tools: [...prev.tools, tool] }));
  const removeTool = (idx: number) => setConfig(prev => ({ ...prev, tools: prev.tools.filter((_, i) => i !== idx) }));

  // Handle Run
  const handleRun = async () => {
    if (!setStepErrors(0) || !setStepErrors(1) || !setStepErrors(2)) {
      setStep([0, 1, 2].find(idx => !pureValidateStep(idx))!);
      return;
    }
    setIsRunning(true);
    try {
      const payload: DeepResearchPromptConfig = {
        ...config,
        tool_choice: toolChoiceOverride !== 'auto' ? { type: toolChoiceOverride } : undefined,
        webhook_url: webhookEnabled ? config.webhook_url : undefined,
      };
      if (savePreset) {
        // Save to localStorage or backend
      }
      const research = {
        id: generateId(),
        title: config.userPrompt.substring(0, 100),
        prompt: JSON.stringify(payload, null, 2),
        status: 'pending' as const,
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
  const previewPayload: DeepResearchPromptConfig = {
    ...config,
    tool_choice: toolChoiceOverride !== 'auto' ? { type: toolChoiceOverride } : undefined,
    webhook_url: webhookEnabled ? config.webhook_url : undefined,
  };
  const previewJson = JSON.stringify(previewPayload, null, 2);

  // UI for each step
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">User Prompt *</label>
              <Textarea
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
              <label className="block text-sm font-medium mb-2">(Optional) System Instructions</label>
              <Textarea
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
              <label className="block text-sm font-medium mb-2">Model *</label>
              <Select
                value={config.model}
                onChange={e => updateConfig({ model: e.target.value as any })}
              >
                <option value="o3-deep-research-2025-06-26">o3-deep-research</option>
                <option value="o4-mini-deep-research-2025-06-26">o4-mini-deep-research</option>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">o4-mini ≈4× cheaper but shorter context</div>
              {errors.model && <div className="text-xs text-destructive">{errors.model}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Output Tokens *</label>
              <Input
                type="number"
                min={100}
                max={config.model === 'o4-mini-deep-research-2025-06-26' ? 64000 : 128000}
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
                  style={{ width: `${Math.min(100, (config.maxTokens / (config.model === 'o4-mini-deep-research-2025-06-26' ? 64000 : 128000)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Context used: {config.maxTokens}</span>
                <span>Limit: {config.model === 'o4-mini-deep-research-2025-06-26' ? '64,000' : '128,000'}</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!config.tools.find(t => t.type === 'web_search_preview')}
                onChange={e => {
                  if (e.target.checked) addTool({ type: 'web_search_preview', search_context_size: 'medium' });
                  else removeTool(config.tools.findIndex(t => t.type === 'web_search_preview'));
                }}
                id="web_search_preview"
              />
              <label htmlFor="web_search_preview" className="font-medium">Enable Web Search Preview</label>
              {config.tools.find(t => t.type === 'web_search_preview') && (
                <Select
                  value={config.tools.find(t => t.type === 'web_search_preview')?.search_context_size || 'medium'}
                  onChange={e => updateTool(config.tools.findIndex(t => t.type === 'web_search_preview'), { search_context_size: e.target.value as any })}
                  className="ml-2 w-32"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!config.tools.find(t => t.type === 'mcp')}
                onChange={e => {
                  if (e.target.checked) addTool({ type: 'mcp', server_label: '', server_url: '', require_approval: 'never' });
                  else removeTool(config.tools.findIndex(t => t.type === 'mcp'));
                }}
                id="mcp"
              />
              <label htmlFor="mcp" className="font-medium">Enable MCP (private data)</label>
            </div>
            {config.tools.find(t => t.type === 'mcp') && (
              <div className="space-y-2 ml-6">
                <Input
                  placeholder="Server label"
                  value={config.tools.find(t => t.type === 'mcp')?.server_label || ''}
                  onChange={e => updateTool(config.tools.findIndex(t => t.type === 'mcp'), { server_label: e.target.value })}
                />
                <Input
                  placeholder="Server URL"
                  value={config.tools.find(t => t.type === 'mcp')?.server_url || ''}
                  onChange={e => updateTool(config.tools.findIndex(t => t.type === 'mcp'), { server_url: e.target.value })}
                />
                <Select
                  value={config.tools.find(t => t.type === 'mcp')?.require_approval || 'never'}
                  onChange={e => updateTool(config.tools.findIndex(t => t.type === 'mcp'), { require_approval: e.target.value as any })}
                >
                  <option value="never">never</option>
                  <option value="auto">auto</option>
                  <option value="manual">manual</option>
                </Select>
                {errors.server_label && <div className="text-xs text-destructive">{errors.server_label}</div>}
                {errors.server_url && <div className="text-xs text-destructive">{errors.server_url}</div>}
              </div>
            )}
            {(!config.tools || config.tools.length === 0) && (
              <div className="text-xs text-destructive">{errors.tools || 'Select at least one tool (required by Deep Research models).'}</div>
            )}
            {config.tools.length > 1 && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Tool Choice Override</label>
                <Select
                  value={toolChoiceOverride}
                  onChange={e => setToolChoiceOverride(e.target.value as any)}
                  className="w-48"
                >
                  <option value="auto">auto</option>
                  <option value="web_search_preview">web_search_preview</option>
                  <option value="mcp">mcp</option>
                </Select>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Reasoning summary</label>
              <Select
                value={config.reasoning?.summary || 'auto'}
                onChange={e => updateConfig({ reasoning: { summary: e.target.value as any, effort: config.reasoning?.effort || 'medium' } })}
              >
                <option value="auto">auto</option>
                <option value="concise">concise</option>
                <option value="detailed">detailed</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reasoning effort</label>
              <Select
                value={config.reasoning?.effort || 'medium'}
                onChange={e => updateConfig({ reasoning: { effort: e.target.value as any, summary: config.reasoning?.summary || 'auto' } })}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Seed (replay)</label>
              <Input
                type="number"
                value={config.seed || ''}
                onChange={e => updateConfig({ seed: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Optional seed for deterministic runs"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.background}
                onChange={e => updateConfig({ background: e.target.checked })}
                id="background"
              />
              <label htmlFor="background">Run asynchronously</label>
            </div>
            <div className="mt-2">
              <input
                type="checkbox"
                checked={webhookEnabled}
                onChange={e => setWebhookEnabled(e.target.checked)}
                id="webhook"
              />
              <label htmlFor="webhook" className="ml-2">Webhook URL</label>
              {webhookEnabled && (
                <Input
                  className="mt-2"
                  value={config.webhook_url || ''}
                  onChange={e => updateConfig({ webhook_url: e.target.value })}
                  placeholder="https://yourapp.com/openai/webhook"
                />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Async saves browser waiting time; results will POST to your webhook.</div>
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
            <Button size="sm" variant={savePreset ? 'secondary' : 'outline'} onClick={() => setSavePreset(v => !v)} title="Save as preset">
              ★
            </Button>
          </div>
          <div className="mb-6">
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Step {step + 1} of {SIDEBAR_STEPS.length}</span>
              <div className="flex-1" />
              {step > 0 && <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
              {step < SIDEBAR_STEPS.length - 1 && <Button size="sm" onClick={() => { if (pureValidateStep(step)) setStep(step + 1); }}>Next</Button>}
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
            <div className="flex items-center ml-4">
              <input type="checkbox" checked={citationsToggle} onChange={e => setCitationsToggle(e.target.checked)} id="citations" />
              <label htmlFor="citations" className="ml-1 text-xs">Citations in output</label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PromptBuilder; 