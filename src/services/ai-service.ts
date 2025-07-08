import type { PromptConfig, DeepResearchPromptConfig } from '@/types/types'
import { safeParseJSON } from '@/utils/utils'

function mapStatus(apiStatus: string | undefined): 'running' | 'completed' | 'failed' {
  switch (apiStatus) {
    case 'completed':
      return 'completed'
    case 'failed':
    case 'cancelled':
      return 'failed'
    case 'in_progress':
    case 'queued':
    case 'incomplete':
    default:
      return 'running'
  }
}

export interface AIServiceConfig {
  apiKey: string
  baseUrl?: string
  headers?: Record<string, string>
}

class AIService {
  private isOpenRouter: boolean = false;
  private openRouterConfig: AIServiceConfig | null = null;

  constructor(config?: AIServiceConfig) {
    if (config?.apiKey) {
      this.setConfig(config)
    }
  }

  setConfig(config: AIServiceConfig) {
    this.isOpenRouter = config.baseUrl?.includes('openrouter.ai') || false;
    if (this.isOpenRouter) {
      this.openRouterConfig = config;
    }
  }

  async generatePrompt(config: PromptConfig): Promise<string> {
    if (this.isOpenRouter && this.openRouterConfig) {
      // Use OpenRouter's /chat/completions endpoint
      const promptEnhancementPrompt = `You are a research prompt specialist. Create a high-quality, detailed research prompt based on the following requirements:\n\nGoal: ${config.goal}\nScope: ${config.scope}\nConstraints: ${config.constraints}\nDepth Level: ${config.depth}\n\nCreate a clear, specific prompt that will guide a research AI to produce comprehensive, well-cited results. The prompt should be concise but information-rich, following best practices for AI research tasks.\n\nReturn only the optimized research prompt, nothing else.`;
      const res = await fetch(`${this.openRouterConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterConfig.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Research Agent',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'user', content: promptEnhancementPrompt },
          ],
          max_tokens: config.maxTokens || 500,
          temperature: 0.3,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate prompt');
      const data = await safeParseJSON(res);
      return data.choices?.[0]?.message?.content || config.goal;
    }
    throw new Error('OpenAI client not initialized');
  }

  async runDeepResearch(payload: { model: string; input: any[]; max_tokens?: number }): Promise<{
    responseId: string;
    stream: ReadableStream<string>;
  }> {
    if (this.isOpenRouter && this.openRouterConfig) {
      const res = await fetch(`${this.openRouterConfig.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterConfig.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Research Agent',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to start research');
      const data = await safeParseJSON(res);
      const responseId = data.id;
      const self = this;
      const stream = new ReadableStream<string>({
        async start(controller) {
          const pollForUpdates = async () => {
            try {
              const statusRes = await fetch(`${self.openRouterConfig!.baseUrl}/responses/${responseId}`, {
                headers: {
                  'Authorization': `Bearer ${self.openRouterConfig!.apiKey}`,
                  'HTTP-Referer': window.location.origin,
                  'X-Title': 'Research Agent',
                },
              });
              if (!statusRes.ok) throw new Error('Failed to poll research status');
              const status = await safeParseJSON(statusRes);
              const mappedStatus = mapStatus(status.status);
              if (mappedStatus === 'completed') {
                controller.enqueue(JSON.stringify({ status: 'completed', id: responseId }));
                controller.close();
                return;
              }
              if (mappedStatus === 'failed') {
                controller.error(new Error('Research failed'));
                return;
              }
              controller.enqueue(JSON.stringify({ status: 'running', id: responseId }));
              setTimeout(pollForUpdates, 2000);
            } catch (error) {
              controller.error(error);
            }
          };
          pollForUpdates();
        },
      });
      return { responseId, stream };
    }
    throw new Error('OpenAI client not initialized');
  }

  createProgressStream(responseId: string): ReadableStream<string> {
    if (this.isOpenRouter && this.openRouterConfig) {
      const self = this;
      return new ReadableStream<string>({
        async start(controller) {
          const pollForUpdates = async () => {
            try {
              const statusRes = await fetch(`${self.openRouterConfig!.baseUrl}/responses/${responseId}`, {
                headers: {
                  'Authorization': `Bearer ${self.openRouterConfig!.apiKey}`,
                  'HTTP-Referer': window.location.origin,
                  'X-Title': 'Research Agent',
                },
              });
              if (!statusRes.ok) throw new Error('Failed to poll research status');
              const status = await safeParseJSON(statusRes);
              const mappedStatus = mapStatus(status.status);
              if (mappedStatus === 'completed') {
                controller.enqueue(JSON.stringify({ status: 'completed', id: responseId }));
                controller.close();
                return;
              }
              if (mappedStatus === 'failed') {
                controller.error(new Error('Research failed'));
                return;
              }
              controller.enqueue(JSON.stringify({ status: 'running', id: responseId }));
              setTimeout(pollForUpdates, 2000);
            } catch (error) {
              controller.error(error);
            }
          };
          pollForUpdates();
        },
      });
    }
    throw new Error('OpenAI client not initialized');
  }

  async getResearchResult(responseId: string): Promise<string> {
    if (this.isOpenRouter && this.openRouterConfig) {
      const res = await fetch(`${this.openRouterConfig.baseUrl}/responses/${responseId}`, {
        headers: {
          'Authorization': `Bearer ${this.openRouterConfig.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Research Agent',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch research result');
      const result = await safeParseJSON(res);
      const mappedStatus = mapStatus(result.status);
      if (mappedStatus === 'completed') {
        return result.result;
      }
      throw new Error('Research not completed');
    }
    throw new Error('OpenAI client not initialized');
  }
}

export const aiService = new AIService()
export default AIService
