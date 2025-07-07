// Global types for the application
export interface Research {
  id: string
  title: string
  prompt: string
  status: 'pending' | 'running' | 'completed' | 'error'
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
  model: 'gpt-4.1' | 'o3-deep-research'
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

// OpenAI API types
export interface OpenAIResponse {
  id: string
  object: string
  created_at: number
  status: 'completed' | 'running' | 'failed'
  model: string
  output: Array<{
    type: 'message'
    id: string
    status: 'completed'
    role: 'assistant'
    content: Array<{
      type: 'output_text'
      text: string
    }>
  }>
  usage: {
    input_tokens: number
    output_tokens: number
    reasoning_tokens: number
    total_tokens: number
  }
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
  model: 'o3-deep-research-2025-06-26' | 'o4-mini-deep-research-2025-06-26';
  maxTokens: number;
  tools: DeepResearchTool[];
  tool_choice?: { type: 'web_search_preview' | 'mcp' };
  reasoning?: DeepResearchReasoning;
  background?: boolean;
  seed?: number;
  webhook_url?: string;
}