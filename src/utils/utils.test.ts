import { describe, it, expect } from 'vitest'
import { safeParseJSON } from './utils'

function createResponse(body: string, contentType = 'application/json') {
  return new Response(body, { headers: { 'Content-Type': contentType } })
}

describe('safeParseJSON', () => {
  it('parses valid json', async () => {
    const res = createResponse('{"a":1}')
    const data = await safeParseJSON<{a:number}>(res)
    expect(data.a).toBe(1)
  })

  it('throws on invalid json', async () => {
    const res = createResponse('<html></html>', 'text/html')
    await expect(safeParseJSON(res)).rejects.toThrow(/Invalid JSON/)
  })
})
