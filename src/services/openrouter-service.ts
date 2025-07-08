export interface OpenRouterModel {
  id: string
  name: string
}

export async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Research Agent',
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status}`)
  }
  const data = await res.json()
  return data.data as OpenRouterModel[]
}
