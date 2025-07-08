Below is a practical decision-tree style rundown of what you can (and must) configure when calling the **Deep Research API** (o-series models such as `o3-deep-research-2025-06-26` and `o4-mini-deep-research-2025-06-26`).  I’ve grouped the options by the part of the request they belong to and highlighted the trade-offs you’ll care about when wiring this into `openaiService.runDeepResearch`.

---

## 1. Pick the model variant

| Model                                | Typical latency (1 k-token answer) | Price (AUD, ex-GST)                                                                                   | Token window | When to choose                                          |
| ------------------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------- |
| **o3-deep-research-2025-06-26**      | 35-60 s                            | **\$0.016 / k input**; **\$0.064 / k output** (≈ US\$10 / M & US\$40 / M) ([community.openai.com][1]) | 128 k        | Highest quality synthesis; long, citation-rich reports. |
| **o4-mini-deep-research-2025-06-26** | 8-15 s                             | **≈ ¼ the o3 price** ([community.openai.com][1])                                                      | 64 k         | Fast prototypes or when cost & speed outweigh nuance.   |

*(Both deep-research variants are priced **on top of** any tool calls you make.)*

---

## 2. The mandatory **`tools`** array

Deep-research models **refuse the call** unless **at least one** of the following is present:

### a. Built-in live search

```json
{ "type": "web_search_preview" }
```

Optional arguments (all keys are *snake\_case*):

| Key                        | Allowed values                          | Notes                                                                                               |
| -------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `search_context_size`      | `"low"`, `"medium"` (default), `"high"` | Controls how many retrieved passages get stuffed into context and therefore cost. ([github.com][2]) |
| `tool_choice` (root-level) | `{ "type": "web_search_preview" }`      | Forces usage if you don’t want the model to decide. ([note.com][3])                                 |

**Pricing for search calls:** about **US \$10 / 1 k calls** on o-series models. ([cometapi.com][4])

### b. Managed-Content-Provider (**MCP**)

Lets the model query **your own** datastore or index via a small HTTP server that implements the *Model Context Protocol* (search & fetch). Minimal declaration:

```json
{
  "type": "mcp",
  "server_label": "internal_file_lookup",
  "server_url": "https://my-mcp.example.com/sse/",
  "require_approval": "never"
}
```

*You run the server; OpenAI just streams queries to it.* A reference implementation and example request live in the cookbook. ([cookbook.openai.com][5])

**When to use MCP:** private PDFs, curriculum docs, or a vector DB you can’t expose publicly.

### Can I include both tools?

Yes – list both and let the model reach for whichever source makes sense. This is common when you need fresh news **and** private docs side-by-side.

---

## 3. Optional request-wide knobs

| Field               | Values                                  | Why you might set it                                                                                                                          |
| ------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `reasoning.summary` | `"auto"` \| `"concise"` \| `"detailed"` | Returns a short, inspected “chain-of-thought” block for auditing. `"auto"` picks the richest available summariser. ([platform.openai.com][6]) |
| `reasoning.effort`  | `"low"`, `"medium"`, `"high"`           | Cap internal thinking depth; lower effort = cheaper + faster. ([github.com][7])                                                               |
| `background`        | `true`                                  | Runs the job asynchronously (recommended). Pair with `webhook_url` to be notified on completion. ([cometapi.com][4])                          |
| `seed`              | integer                                 | Re-run research deterministically for testing.                                                                                                |

---

## 4. End-to-end example (TypeScript-style)

```ts
client.responses.create({
  model: "o3-deep-research-2025-06-26",
  input: [
    { role: "developer", content: [{ type: "input_text", text: SYSTEM_PROMPT }] },
    { role: "user",      content: [{ type: "input_text", text: userQuery }] }
  ],
  background: true,
  webhook_url: "https://yourapp.com/openai/webhook",
  reasoning: { summary: "auto", effort: "medium" },
  tools: [
    { type: "web_search_preview", search_context_size: "medium" },
    {
      type: "mcp",
      server_label: "curriculum_store",
      server_url: "https://curriculum-mcp.mrsutherland.net/sse/",
      require_approval: "never"
    }
  ],
  tool_choice: { type: "web_search_preview" }  // optional hard-forcing
});
```

---

## 5. Quick troubleshooting checklist

| Symptom                             | Likely cause                               | Fix                                                                                                          |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `400 Deep research models require…` | No `tools` or wrong casing                 | Ensure at least one `web_search_preview` **or** `mcp` object and that `type` keys are snake\_case.           |
| Model ignores search tool           | Autonomous choice won                      | Add `tool_choice` or nudge in the system prompt (“Always use web\_search\_preview when timeliness matters”). |
| Long waits / timeouts               | Synchronous call on big tasks              | Set `background:true` and use webhooks; consider the o4-mini variant.                                        |
| Unexpected cost spike               | `search_context_size` defaulting to *high* | Pass `"low"` or `"medium"` explicitly.                                                                       |

---

### Which path should **you** take?

1. **Just need up-to-the-minute open-web info** → *web\_search\_preview* only (simplest).
2. **Need to blend public news with your Year 5 curriculum PDFs** → use **both** tools.
3. **Need strictly private research (no outbound calls)** → stand-up an MCP server and omit web\_search\_preview entirely.

Because you’re working in an Australian school environment, remember that any MCP server storing student work needs to live on Australian soil if you’re bound by Queensland’s data-sovereignty guidelines.

That’s the landscape in a nutshell—once you add the `tools` array and, if desired, `reasoning`/`background` flags, the 400 error disappears and you’ll start getting nicely cited research dumps ready for your lesson-planning pipelines.

[1]: https://community.openai.com/t/deep-research-in-the-api-webhooks-and-web-search-with-o3/1299919?utm_source=chatgpt.com "Deep research in the API, webhooks, and web search with o3"
[2]: https://github.com/ConechoAI/openai-websearch-mcp "GitHub - ConechoAI/openai-websearch-mcp: openai websearch tool as mcp server"
[3]: https://note.com/npaka/n/n0410c8e3f31e "OpenAI Responses API 入門 (9) - Web search｜npaka"
[4]: https://www.cometapi.com/openai-launches-deep-research-api-add-web-search/ "OpenAI Launches Deep Research API and Adds Web Search to o3, o3-Pro, and o4-Mini Models - CometAPI"
[5]: https://cookbook.openai.com/examples/deep_research_api/how_to_build_a_deep_research_mcp_server/readme "Building a Deep Research MCP Server"
[6]: https://platform.openai.com/docs/guides/reasoning?utm_source=chatgpt.com "Reasoning models - OpenAI API"
[7]: https://github.com/openai/openai-node/issues/1487?utm_source=chatgpt.com "Missing `Summary` Type on reasoning parameter for reasoning model calls ..."
