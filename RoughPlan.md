## Executive summary

The web-app will be a **self-contained React SPA** that wraps OpenRouter’s Deep Research API. It walks the user from crafting a lean, high-signal prompt (with GPT-4.1) to running the research task (with the o3 reasoning model), then lets them explore, export and archive every artefact—**all saved locally in a user-chosen folder**. Optional hooks push the same content to a Notion database and, on demand, to any Obsidian vault the user selects. The design stays fully client-side: an `.env` file supplies each user’s personal OpenAI key, and the browser’s File System Access API handles read/write operations, so no server or cloud database is required. ([cookbook.openai.com](https://cookbook.openai.com/examples/deep_research_api/introduction_to_deep_research_api?utm_source=chatgpt.com), [openai.com](https://openai.com/index/introducing-deep-research/?utm_source=chatgpt.com), [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API?utm_source=chatgpt.com))


In brief: a well-structured React app can wrap the Deep Research API by splitting its workflow into discrete modules—Prompt Builder, Agent Runner, Results Viewer, Export & Sync, and Task Log—each communicating through shared context or an event bus.  Leveraging model-specific UI, streaming updates, and export libraries lets the app orchestrate O 3 for research and GPT-4.1 for prompt-crafting while archiving every artefact (prompts, chain-of-thought, final report) as Markdown, DOCX, and PDF.  Adding optional back-ends for vector search (pgvector/Supabase), Notion page creation, and Obsidian vault sync turns it into a one-stop research cockpit.  Below is a detailed architecture outline plus suggestions for pushing the idea further.

## 1  Current concept and high-level modular design

The Cookbook flow shows the agent receives a **concise, information-rich prompt**, then autonomously breaks the task into sub-queries and returns a structured, cited report ([cookbook.openai.com](https://cookbook.openai.com/examples/deep_research_api/introduction_to_deep_research_api?utm_source=chatgpt.com)).
A React single-page app can mirror that pipeline with five logical modules:

| Module             | Key responsibility                                                                                                                                                                                                                                                                                                                                                                                   | Typical libs / patterns                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prompt Builder** | Collect user intent, budget tokens, choose model (4.1)                                                                                                                                                                                                                                                                                                                                               | React Hook Form + TanStack Query for model metadata ([tanstack.com](https://tanstack.com/query/v4/docs/framework/react/overview?utm_source=chatgpt.com))        |
| **Agent Runner**   | Dispatch prompt to Deep Research (O 3), stream progress & chain-of-thought                                                                                                                                                                                                                                                                                                                           | Fetch API + Server-Sent Events/Web Sockets                                                                                                                      |
| **Results Viewer** | Render timeline of thoughts, sub-answers, citations                                                                                                                                                                                                                                                                                                                                                  | Virtualised list; timeline components                                                                                                                           |
| **Export & Sync**  | Convert HTML/MD to: 1 Markdown, 2 DOCX (docxtemplater ([docxtemplater.com](https://docxtemplater.com/?utm_source=chatgpt.com)) or docx.js ([docx.js.org](https://docx.js.org/?utm_source=chatgpt.com))), 3 PDF (pdf-lib/jsPDF ([pdf-lib.js.org](https://pdf-lib.js.org/?utm_source=chatgpt.com), [github.com](https://github.com/parallax/jsPDF?utm_source=chatgpt.com))); push to Notion & Obsidian |                                                                                                                                                                 |
| **Task Log**       | Persist every run for recall & search                                                                                                                                                                                                                                                                                                                                                                | IndexedDB or Supabase table (vector column via pgvector ([supabase.com](https://supabase.com/docs/guides/database/extensions/pgvector?utm_source=chatgpt.com))) |

Each module is a standalone folder with its own store slice, allowing future extraction into micro-front-ends.

## 2  Detailed module notes

### 2.1 Prompt Builder

* Multi-step wizard asks "Research goal", "Key constraints", "Preferred depth", etc., then shows live token estimate to keep under budget, echoing the Cookbook guidance ([cookbook.openai.com](https://cookbook.openai.com/examples/deep_research_api/introduction_to_deep_research_api_agents?utm_source=chatgpt.com)).
* Model selector drop-down defaults to **GPT-4.1** for prompt generation and **O 3** for research; versions are fetched dynamically from the OpenAI models endpoint and cached with TanStack Query ([tanstack.com](https://tanstack.com/query/v4/docs/framework/react/overview?utm_source=chatgpt.com)).
* Output: final compiled Markdown prompt, displayed with a **"Download .md"** button.

### 2.2 Agent Runner

* Sends the prompt to the Deep Research endpoint; streams the tool's self-talk and interim findings to a progress pane, similar to the Guardian/The Verge demos of the feature ([theguardian.com](https://www.theguardian.com/technology/2025/feb/03/openai-deep-research-agent-chatgpt-deepseek?utm_source=chatgpt.com), [theverge.com](https://www.theverge.com/news/604902/chagpt-deep-research-ai-agent?utm_source=chatgpt.com)).
* On completion, receives a JSON object containing `report`, `thought_process`, `citations`.

### 2.3 Results Viewer

* Three tabs: **Report**, **Thought Process**, **Sources**.
* Timeline component shows agent's sub-questions and answers as cards.
* Each citation links out and is stored alongside an `archived_at` timestamp for provenance.

### 2.4 Export & Sync

* **Markdown**: prompt & report already in MD → single click to save as file object.
* **DOCX**: transform Markdown → HTML → docxtemplater/docx.js to embed headings, hyperlinks ([timweiss.net](https://timweiss.net/blog/2022-08-29-generating-word-documents-with-docxtemplater-in-nodejs/?utm_source=chatgpt.com), [docxtemplater.com](https://docxtemplater.com/?utm_source=chatgpt.com)).
* **PDF**: render report HTML to canvas via html2canvas, pipe into jsPDF or pdf-lib ([github.com](https://github.com/apipemc/jspdf-react?utm_source=chatgpt.com), [github.com](https://github.com/surajsnanavare/react-pdf-export?utm_source=chatgpt.com)).
* **Notion**: call `pages.create()` and push blocks in Markdown order ([developers.notion.com](https://developers.notion.com/docs/working-with-page-content?utm_source=chatgpt.com)).
* **Obsidian**: write `.md` into a vault folder chosen via File System Access API; Obsidian auto-refreshes ([help.obsidian.md](https://help.obsidian.md/data-storage?utm_source=chatgpt.com)).

### 2.5 Task Log & Retrieval

* Store every run (prompt, parameters, embeddings) in Supabase.
* A `/history` route lists past tasks, offers semantic search using pgvector similarity ([supabase.com](https://supabase.com/docs/guides/database/extensions/pgvector?utm_source=chatgpt.com)).

## 3  Ideas to improve and extend

### 3.1 Research quality & cost controls

* **Dynamic depth slider** that changes the agent plan length (and therefore cost/time).
* **Auto-critique pass**: after the report, run GPT-4.1 to critique and suggest follow-up queries.
* **Trusted-source filter**: allow users to pre-select domains; pass to the agent as allowed search scope.

### 3.2 Collaboration & versioning

* Real-time collaborative prompt editing with Y.js.
* Comment threads on individual agent thought steps for peer review.

### 3.3 Knowledge-base integration

* Automatic push of report plus embeddings into a shared Supabase or Pinecone index so later prompts can cite earlier research.
* Notion database view that aggregates "Research Topic", "Date", "Key Findings", linking back to exported files.

### 3.4 Automation hooks

* Let users schedule periodic "update this research" runs (weekly cron) and notify via email or Slack.
* Webhook to Flowise/n8n so research outputs can trigger downstream workflows (e.g., auto-generate slide decks).

### 3.5 Accessibility & UI polish

* Progressive disclosure: hide advanced settings behind an accordion to keep the interface clean for students.
* Provide WAI-ARIA labels on dropdowns and live-region announcements for streaming updates.

## 4  Questions & next-step prompts

1. **Storage preference:** Would you favour keeping logs client-side (IndexedDB) or in Supabase for easier cross-device access?
2. **Auth scope:** Should the app rely on your existing OpenAI API key per user, or offer a proxy back-end?
3. **Notion structure:** Do you want each research run to be its own page, or aggregated under a single database table?
4. **Obsidian vault path:** Will users pick the vault folder each time, or save a default path in settings?
5. **Export fidelity:** Is basic styling acceptable, or do you require branded DOCX/PDF templates?

Let me know which directions resonate, and I can drill down into implementation details or refine the UX flow.

* [theguardian.com](https://www.theguardian.com/technology/2025/feb/03/openai-deep-research-agent-chatgpt-deepseek?utm_source=chatgpt.com)
* [theverge.com](https://www.theverge.com/news/604902/chagpt-deep-research-ai-agent?utm_source=chatgpt.com)



---

## 1  Modular architecture (updated)

| Module             | Purpose                                                                                             | Key tech & notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prompt Builder** | Multi-step wizard gathers goal, scope, constraints; token gauge; model picker defaulting to GPT-4.1 | React Hook Form + TanStack Query to fetch live model list ([tanstack.com](https://tanstack.com/query/v4/docs/framework/react/guides/queries?utm_source=chatgpt.com))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Agent Runner**   | Streams Deep Research progress & final report from o3                                               | native `fetch` + Server-Sent Events; shows sub-tasks timeline                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Results Viewer** | Tabs: Report / Thought-Process / Sources; expandable cards                                          | virtualised list for long runs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Export & Sync**  | Output to Markdown (one-click), DOCX, PDF; push to Notion & Obsidian                                | docxtemplater / docx.js ([docxtemplater.com](https://docxtemplater.com/?utm_source=chatgpt.com), [docx.js.org](https://docx.js.org/?utm_source=chatgpt.com)) ; html2canvas + jsPDF or pdf-lib for PDFs ([phppot.com](https://phppot.com/javascript/jspdf-html-example/?utm_source=chatgpt.com), [pdf-lib.js.org](https://pdf-lib.js.org/?utm_source=chatgpt.com)) ; Notion pages under a single research table ([developers.notion.com](https://developers.notion.com/docs/working-with-databases?utm_source=chatgpt.com)) ; Obsidian vault chosen per run, plain MD write-out ([help.obsidian.md](https://help.obsidian.md/data-storage?utm_source=chatgpt.com)) |
| **Local Task Log** | Persists every run (prompt, JSON result, exports) as files in the chosen folder                     | File System Access API `showDirectoryPicker()` & JSON manifests ([web.dev](https://web.dev/patterns/files/save-a-file/?utm_source=chatgpt.com), [developer.chrome.com](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access?utm_source=chatgpt.com))                                                                                                                                                                                                                                                                                                                                                                                        |

### Folder layout inside the chosen directory

```
/MyResearchRuns
 ├─ YYYY-MM-DD_topic/
 │   ├─ prompt.md
 │   ├─ report.md
 │   ├─ thought-process.md
 │   ├─ report.docx
 │   ├─ report.pdf
 │   └─ meta.json
 └─ manifest.json   ← index of all runs
```

---

## 2  Storage, security & configuration

* **Purely local files** – the File System Access API lets users grant the app permission once and then read/write every artefact directly to disk, matching the "Documents"-folder preference and working offline. ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API?utm_source=chatgpt.com), [web.dev](https://web.dev/patterns/files/save-a-file/?utm_source=chatgpt.com))
* **Environment variables** – each user creates a `.env` (plus an `example.env`) at the project root:

  ```
  REACT_APP_OPENAI_API_KEY=sk-…
  ```

  Create-React-App (or Vite) exposes it as `import.meta.env`. ([create-react-app.dev](https://create-react-app.dev/docs/adding-custom-environment-variables/?utm_source=chatgpt.com), [stackoverflow.com](https://stackoverflow.com/questions/75152513/how-to-create-a-env-with-with-the-apikey-of-openai-in-a-react-app?utm_source=chatgpt.com))
* **No hosted DB** – task history lives in `manifest.json`; if semantic search is later desired, embeddings can be kept in a local JSON vector file.
* **API key stays private** – because everything runs in the browser, the key never leaves the user's machine. Best-practice notes still apply. ([help.openai.com](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety?utm_source=chatgpt.com))

---

## 3  Export & sync details

### Markdown

Prompt, report and chain-of-thought are already Markdown; they're saved verbatim.

### DOCX

Use **docxtemplater** or **docx.js** to convert MD→HTML→DOCX, preserving headings and hyperlinks. ([docxtemplater.com](https://docxtemplater.com/?utm_source=chatgpt.com), [docx.js.org](https://docx.js.org/?utm_source=chatgpt.com))

### PDF

Render the report tab to canvas with **html2canvas**, then pipe into **jsPDF** or **pdf-lib** for multi-page output. ([phppot.com](https://phppot.com/javascript/jspdf-html-example/?utm_source=chatgpt.com), [pdf-lib.js.org](https://pdf-lib.js.org/?utm_source=chatgpt.com))

### Notion

* One **Research Log** database holds properties (*Date*, *Topic*, *Status*, *Cost*).
* Each run creates a **child page** below that row and embeds the DOCX/PDF via `file` blocks. ([developers.notion.com](https://developers.notion.com/docs/working-with-databases?utm_source=chatgpt.com))

### Obsidian

* On export, the user picks (via file picker) a vault folder; the app writes the same Markdown files there—Obsidian refreshes automatically. ([help.obsidian.md](https://help.obsidian.md/data-storage?utm_source=chatgpt.com))

---

## 4  UX enhancements & future ideas

| Category                   | Improvement                                                                  | Rationale                                                                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cost control**           | Depth slider adjusts agent recursion level; live cost estimate               | prevents token overruns                                                                                                                                                                           |
| **Quality assurance**      | GPT-4.1 self-critique pass summarises gaps, suggests follow-ups              | higher trust                                                                                                                                                                                      |
| **Trusted sources**        | Domain allow-list fed to agent's search tool                                 | research reliability                                                                                                                                                                              |
| **Collaboration**          | Optional shared prompt editing via **Y.js** CRDT layer                       | pairs or student groups can co-design prompts in real time ([dev.to](https://dev.to/route06/tutorial-building-a-collaborative-editing-app-with-yjs-valtio-and-react-1mcl?utm_source=chatgpt.com)) |
| **Automation hooks**       | Schedule re-runs via OS cron + desktop notifications; Flowise/n8n webhook    | keeps research up-to-date                                                                                                                                                                         |
| **Accessibility & polish** | WAI-ARIA labels, keyboard shortcuts, metric unit defaults, responsive layout | meets classroom needs                                                                                                                                                                             |

---

## 5  Next steps

1. Decide on the front-end stack (CRA vs Vite) and bootstrap the `.env` pattern.
2. Prototype File System Access workflow for creating the `MyResearchRuns` directory.
3. Scaffold the Prompt Builder with live token estimator.
4. Implement Agent Runner streaming using the Deep Research endpoint.
5. Build export pipeline (MD → DOCX/PDF) and Notion integration.
6. Add optional Y.js collaborative layer.

