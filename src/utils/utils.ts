import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatTokenCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

export function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  // Pricing as of 2025
  const pricing = {
    'gpt-4.1': { input: 2.5, output: 10 }, // per 1M tokens
    'o3-deep-research': { input: 10, output: 40 }, // per 1M tokens
  }

  const modelPricing = pricing[model as keyof typeof pricing]
  if (!modelPricing) return 0

  return (
    (inputTokens / 1000000) * modelPricing.input +
    (outputTokens / 1000000) * modelPricing.output
  )
}

/**
 * Safely parse a `Response` body as JSON. If the body cannot be parsed,
 * an error is thrown that includes the first part of the response text
 * to aid debugging.
 */
export async function safeParseJSON<T = any>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`)
  }
}