import OpenAI from 'openai'
import type { OpenAIResponse, PromptConfig, DeepResearchPromptConfig } from '@/types/types'

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

function mapUsage(apiUsage: any): OpenAIResponse['usage'] {
  return {
    input_tokens: apiUsage?.input_tokens ?? 0,
    output_tokens: apiUsage?.output_tokens ?? 0,
    reasoning_tokens: apiUsage?.reasoning_tokens ?? 0,
    total_tokens: apiUsage?.total_tokens ?? 0,
  }
}

class OpenAIService {
  private client: OpenAI | null = null

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Required for client-side usage
      })
    }
  }

  setApiKey(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  }

  async generatePrompt(config: PromptConfig): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }

    const promptEnhancementPrompt = `You are a research prompt specialist. Create a high-quality, detailed research prompt based on the following requirements:

Goal: ${config.goal}
Scope: ${config.scope}
Constraints: ${config.constraints}
Depth Level: ${config.depth}

Create a clear, specific prompt that will guide a research AI to produce comprehensive, well-cited results. The prompt should be concise but information-rich, following best practices for AI research tasks.

Return only the optimized research prompt, nothing else.`

    const response = await this.client.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'user',
          content: promptEnhancementPrompt,
        },
      ],
      max_tokens: config.maxTokens || 500,
      temperature: 0.3,
    })

    return response.choices[0]?.message?.content || config.goal
  }

  async runDeepResearch(config: DeepResearchPromptConfig): Promise<{
    responseId: string
    stream: ReadableStream<string>
  }> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }

    // Compose the input array for the API
    const input = [
      { role: 'developer', content: [{ type: 'input_text', text: config.systemPrompt || '' }] },
      { role: 'user', content: [{ type: 'input_text', text: config.userPrompt }] },
    ]

    // Build the payload
    const payload: any = {
      model: config.model,
      input,
      tools: config.tools,
      background: config.background,
      webhook_url: config.webhook_url,
      seed: config.seed,
    }
    if (config.reasoning) payload.reasoning = config.reasoning;
    if (config.tool_choice) payload.tool_choice = config.tool_choice;

    // Remove undefined fields
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    // Create research task
    const response = await this.client.responses.create(payload);

    const responseId = response.id;
    const self = this;

    // Create a stream for progress updates
    const stream = new ReadableStream<string>({
      async start(controller) {
        // Poll for updates
        const pollForUpdates = async () => {
          try {
            const status = await self.client!.responses.retrieve(responseId);
            const mappedStatus = mapStatus(status.status);
            const mapped = {
              ...status,
              status: mappedStatus,
              usage: mapUsage(status.usage),
            };
            if (mapped.status === 'completed') {
              controller.enqueue(JSON.stringify(mapped));
              controller.close();
              return;
            }
            if (mapped.status === 'failed') {
              controller.error(new Error('Research failed'));
              return;
            }
            // Send progress update
            controller.enqueue(JSON.stringify({ status: 'running', id: responseId }));
            // Continue polling
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

  async getResearchResult(responseId: string): Promise<OpenAIResponse> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }
    const result = await this.client.responses.retrieve(responseId)
    const mappedStatus = mapStatus(result.status)
    return {
      ...result,
      status: mappedStatus,
      usage: mapUsage(result.usage),
    } as OpenAIResponse
  }
}

export const openaiService = new OpenAIService()
export default OpenAIService