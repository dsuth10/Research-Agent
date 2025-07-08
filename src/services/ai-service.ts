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

export interface AIServiceConfig {
  apiKey: string
  baseUrl?: string
  headers?: Record<string, string>
}

class AIService {
  private client: OpenAI | null = null

  constructor(config?: AIServiceConfig) {
    if (config?.apiKey) {
      this.setConfig(config)
    }
  }

  setConfig(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      defaultHeaders: config.headers,
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
      model: config.model,
      messages: [
        { role: 'user', content: promptEnhancementPrompt },
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

    const input = [
      { role: 'developer', content: [{ type: 'input_text', text: config.systemPrompt || '' }] },
      { role: 'user', content: [{ type: 'input_text', text: config.userPrompt }] },
    ]

    const payload: any = {
      model: config.model,
      input,
      tools: config.tools,
      background: config.background,
      webhook_url: config.webhook_url,
      seed: config.seed,
    }
    if (config.reasoning) payload.reasoning = config.reasoning
    if (config.tool_choice) payload.tool_choice = config.tool_choice

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const response = await this.client.responses.create(payload)

    const responseId = response.id
    const self = this

    const stream = new ReadableStream<string>({
      async start(controller) {
        const pollForUpdates = async () => {
          try {
            const status = await self.client!.responses.retrieve(responseId)
            const mappedStatus = mapStatus(status.status)
            const mapped = {
              ...status,
              status: mappedStatus,
              usage: mapUsage(status.usage),
            }
            if (mapped.status === 'completed') {
              controller.enqueue(JSON.stringify(mapped))
              controller.close()
              return
            }
            if (mapped.status === 'failed') {
              controller.error(new Error('Research failed'))
              return
            }
            controller.enqueue(JSON.stringify({ status: 'running', id: responseId }))
            setTimeout(pollForUpdates, 2000)
          } catch (error) {
            controller.error(error)
          }
        }
        pollForUpdates()
      },
    })

    return { responseId, stream }
  }

  createProgressStream(responseId: string): ReadableStream<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }
    const self = this
    return new ReadableStream<string>({
      async start(controller) {
        const pollForUpdates = async () => {
          try {
            const status = await self.client!.responses.retrieve(responseId)
            const mappedStatus = mapStatus(status.status)
            const mapped = {
              ...status,
              status: mappedStatus,
              usage: mapUsage(status.usage),
            }
            if (mapped.status === 'completed') {
              controller.enqueue(JSON.stringify(mapped))
              controller.close()
              return
            }
            if (mapped.status === 'failed') {
              controller.error(new Error('Research failed'))
              return
            }
            controller.enqueue(JSON.stringify({ status: 'running', id: responseId }))
            setTimeout(pollForUpdates, 2000)
          } catch (error) {
            controller.error(error)
          }
        }
        pollForUpdates()
      },
    })
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

export const aiService = new AIService()
export default AIService
