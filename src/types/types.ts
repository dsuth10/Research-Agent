// Event/Data Contract: Agent Runner updates the Research object (including result, status, cost) in Zustand store. Results Viewer subscribes to currentResearch and reflects updates in real-time. All updates are propagated via Zustand state.
// Global types for the application
export interface Research {
  id: string
  title: string
  prompt: string
  status: 'pending' | 'running' | 'completed' | 'error'
  /** OpenAI response ID used to resume polling if the page reloads */
  responseId?: string
  createdAt: string
  completedAt?: string
  result?: ResearchResult
  cost?: {
    inputTokens: number
    outputTokens: number
    totalCost: number
  }
}

export interface ResearchResult {
  report: string
  thoughtProcess: string
  sources: Source[]
  reasoning?: {
    effort: string
    summary: string
  }
}

export interface Source {
  id: string
  title: string
  url: string
  snippet: string
  citedAt: string
}

export interface PromptConfig {
  goal: string
  scope: string
  constraints: string
  depth: 'low' | 'medium' | 'high'
  model: string
  maxTokens?: number
}

export interface ExportOptions {
  format: 'markdown' | 'docx' | 'pdf'
  includeThoughtProcess: boolean
  includeSources: boolean
  template?: string
}

export interface FileSystemHandle {
  kind: 'file' | 'directory'
  name: string
}

export interface DeepResearchTool {
  type: 'web_search_preview' | 'mcp';
  search_context_size?: 'low' | 'medium' | 'high';
  server_label?: string;
  server_url?: string;
  require_approval?: 'never' | 'auto' | 'manual';
}

export interface DeepResearchReasoning {
  summary: 'auto' | 'concise' | 'detailed';
  effort: 'low' | 'medium' | 'high';
}

export interface DeepResearchPromptConfig {
  userPrompt: string;
  systemPrompt?: string;
  model: string;
  maxTokens: number;
  tools: DeepResearchTool[];
  tool_choice?: { type: 'web_search_preview' | 'mcp' };
  reasoning?: DeepResearchReasoning;
  background?: boolean;
  seed?: number;
  webhook_url?: string;
}