Below is a pragmatic, component-level wire-frame you can adapt to any web stack (React, Vue, plain HTML).  The grouping matches the way the Deep Research API validates requests
---

## 1. Page/Shell Layout

```
┌─────────────────── HEADER ───────────────────┐
│  🔍 Deep Research Job Config  |  [Run ▶]     │
└──────────────────────────────────────────────┘
│ Sidebar (step nav) │   Main Config Surface   │
└──────────────────────────────────────────────┘
```

**Why**
*The sidebar keeps the mental model clear (“fill these steps top-to-bottom”), while the fixed Run button lets advanced users jump around.*

---

## 2. Sidebar Steps (vertical list)

| # | Label              | Purpose                      | Validation dot |
| - | ------------------ | ---------------------------- | -------------- |
| 1 | **Query & Prompt** | user prompt + system prompt  | ● / ✓          |
| 2 | **Model & Tokens** | choose model, token budget   | ● / ✓          |
| 3 | **Tools**          | web search + MCP toggles     | ● / ✓          |
| 4 | **Advanced**       | reasoning flags, seed, async | ● / ✓          |
| 5 | **Preview JSON**   | read-only payload view       | —              |

*(The coloured dot turns green once the section’s required fields are valid.)*

---

## 3. Main-panel component layouts

### 3.1 Query & Prompt

```
[ TextArea ]  →  “User prompt”
[ TextArea ]  →  “(Optional) System instructions”
```

*Tips: character counters beneath each area; auto-expand on focus.*

---

### 3.2 Model & Tokens

| Field                   | Control                                                   | Default | Tooltip                                   |
| ----------------------- | --------------------------------------------------------- | ------- | ----------------------------------------- |
| **Model**               | `<Select>` (`o3-deep-research` / `o4-mini-deep-research`) | o3      | “o4-mini ≈4× cheaper but shorter context” |
| **Max Output Tokens**   | `<NumberInput>`                                           | 2 000   | “Hard ceiling—cost ∝ length”              |
| **Context Limit Gauge** | Progress-bar showing % budget used (prompt + tools)       |         |                                           |

---

### 3.3 Tools (the critical section)

```
[✓] Enable Web Search Preview
      Search context size: (low • medium ○ high)

[✓] Enable MCP (private data)
      Server label        [____________]
      Server URL          [____________]
      Approval mode       (never • auto ○ manual)
```

*Behaviour*

* If **neither** box is ticked, render an inline error: “Select at least one tool (required by Deep Research models).”
* When both are ticked, show an optional **Tool Choice Override** select (`auto` | `web_search_preview` | `mcp`).

---

### 3.4 Advanced

| Field              | Control                                    | Default |
| ------------------ | ------------------------------------------ | ------- |
| Reasoning summary  | `<Select>` (`auto`, `concise`, `detailed`) | auto    |
| Reasoning effort   | `<Select>` (`low`, `medium`, `high`)       | medium  |
| Seed (replay)      | `<NumberInput>` (nullable)                 | —       |
| Run asynchronously | `<Toggle>`                                 | ON      |
| Webhook URL        | `<Input>` (visible only if async ON)       |         |

*Inline hint: “Async saves browser waiting time; results will POST to your webhook.”*

---

### 3.5 Preview JSON (read-only, monospace)

Auto-updates as users edit.  Good for copy-pasting into tests.

---

## 4. Run flow

1. **Press “Run”** → client-side final validation.
2. POST job; on success flash a toast: *“Job queued – you’ll receive the response at <webhook>”* **or** open a live SSE monitor if synchronous.

---

## 5. Responsive tweaks

* **≤ 768 px width**: collapse sidebar into a top breadcrumb bar; sections become accordion panels.
* Keep Run button sticky at the bottom of the viewport on mobile.

---

#### Quick wins for user happiness

| UX nicety                                  | Why it matters                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| **Save as preset** (star icon near header) | Teachers can store “Year-5 News Scan” template.                                     |
| **Cost estimator** under the Run button    | Shows predicted AUD based on token + search calls.                                  |
| **Citations toggle** in output viewer      | One-click to copy results **with** or **without** citation blocks for lesson plans. |

---

