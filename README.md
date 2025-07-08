# Research Agent

A modern, scalable React SPA for advanced research workflows, powered exclusively by OpenRouter. This application provides a robust, user-friendly interface for prompt creation, research execution, result analysis, and export, all with local-first security and performance.

## Features
- **Prompt Builder**: Multi-step wizard for crafting and optimizing research prompts with real-time token/cost estimation. Supports only OpenRouter-compatible models and options.
- **Agent Runner**: Executes research tasks with streaming updates and cost tracking. Payloads are always OpenRouter-compliant.
- **Results Viewer**: Tabbed interface for report analysis, citation management, and multi-format export (PDF, DOCX, Markdown).
  - Tabbed UI: Report, Thought Process, Sources
  - Inline citation management: clickable citations, source highlighting, verification status
  - Export: Markdown, PDF, DOCX (with cost and token usage)
  - Real-time updates: subscribes to research results and progress from Agent Runner via Zustand
  - Error handling: displays errors and allows retry
  - Interactive tools: search/filter, expand/collapse sources
- **Export & Sync**: Export to PDF, DOCX, Markdown, and sync with Notion/Obsidian.
- **Task Log**: Local research history, search/filter, analytics, and export/backup.
- **Secure API Key Management**: Client-side only, with `.env.local` support for OpenRouter API keys.
- **Modern Testing**: Vitest, React Testing Library, and Playwright for comprehensive testing.

## Architecture
- **Results Viewer Integration**: Results Viewer subscribes to the Zustand store for `currentResearch` and updates in real-time as Agent Runner streams progress and results. All updates (status, result, cost, errors) are reflected instantly in the Results Viewer UI.
- **Citation Management**: Inline citations in the report are clickable and highlight the corresponding source in the Sources tab. Each source displays verification status and citation timestamp.
- **Export System**: Uses `pdf-lib` for PDF, `docx` for Word, and native Markdown string processing. Files are saved using the File System Access API.
- **Error Handling**: If research fails, Results Viewer displays an error message and a retry button, which resets the research status for rerun.

## Usage Examples & Developer Notes

### Using the Results Viewer
- **View Results**: After running a research task, switch to the Results tab to see the report, thought process, and sources.
- **Citations**: Click on inline citations (e.g., [1]) in the report to jump to the corresponding source in the Sources tab.
- **Export**: Use the Export buttons to save results as Markdown, PDF, or DOCX. Files are saved locally using the File System Access API.
- **Search/Filter**: Use the search bar to filter report lines and sources by keyword.
- **Expand/Collapse**: Click the arrow next to each source to expand or collapse its details.
- **Error Handling**: If an error occurs, an error message and Retry button will appear. Click Retry to rerun the research task.

### Developer Notes
- **Integration**: Results Viewer listens to Zustand's `currentResearch` for real-time updates. Agent Runner updates this state as research progresses.
- **Extensibility**: To add new export formats, implement the logic in Results Viewer and use `fileSystemService.saveFile` for saving.
- **Testing**: Unit and integration tests are provided in `ResultsViewer.test.tsx` and `ResultsViewer.integration.test.tsx`.
- **Styling**: Follows shadcn/ui and Tailwind CSS conventions for consistency.

## Tech Stack
- **Frontend**: React 18 (TypeScript), Vite 5.x
- **State Management**: TanStack Query v5, Zustand v4
- **Forms**: React Hook Form v7, Zod
- **Styling**: Tailwind CSS, shadcn/ui patterns
- **Export**: pdf-lib, docx.js, markdown-it
- **API**: OpenRouter (all research and prompt generation)
- **File System**: File System Access API, browser-fs-access
- **Testing**: Vitest, React Testing Library, Playwright

## Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the app locally:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```
4. **Run tests:**
   ```bash
   npm test
   ```

## Project Structure
- `src/` — Main application code (components, modules, services, store, styles)
- `public/` — Static assets and HTML template
- `tests/` — Unit, integration, and e2e tests
- `Complete Technical Guide.md` — Full technical documentation

## Security
- API keys are managed client-side via `.env.local` (never committed). Use `VITE_OPENROUTER_API_KEY` for OpenRouter access.
- All file operations require explicit user consent
- HTTPS required for full functionality

## Repository
[GitHub: dsuth10/Research-Agent](https://github.com/dsuth10/Research-Agent)

---
For full technical details, see `Complete Technical Guide.md`. 