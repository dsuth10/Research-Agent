# Research Agent

A modern, scalable React SPA that wraps OpenAI's Deep Research API, providing a robust, user-friendly interface for advanced research workflows. This application features local file management, comprehensive export options, and optional cloud integrations, all while maintaining high security and performance standards.

## Features
- **Prompt Builder**: Multi-step wizard for crafting and optimizing research prompts with real-time token/cost estimation.
- **Agent Runner**: Executes Deep Research tasks with streaming updates, background management, and cost tracking.
- **Results Viewer**: Tabbed interface for report analysis, citation management, and multi-format export (PDF, DOCX, Markdown).
- **Export & Sync**: Export to PDF, DOCX, Markdown, and sync with Notion/Obsidian.
- **Task Log**: Local research history, search/filter, analytics, and export/backup.
- **Secure API Key Management**: Client-side only, with .env.local support.
- **Modern Testing**: Vitest, React Testing Library, and Playwright for comprehensive testing.

## Tech Stack
- **Frontend**: React 18 (TypeScript), Vite 5.x
- **State Management**: TanStack Query v5, Zustand v4
- **Forms**: React Hook Form v7, Zod
- **Styling**: Tailwind CSS, shadcn/ui patterns
- **Export**: pdf-lib, docx.js, markdown-it
- **API**: OpenAI (o3-deep-research-2025-06-26, GPT-4.1)
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
- API keys are managed client-side via `.env.local` (never committed)
- All file operations require explicit user consent
- HTTPS required for full functionality

## Repository
[GitHub: dsuth10/Research-Agent](https://github.com/dsuth10/Research-Agent)

---
For full technical details, see `Complete Technical Guide.md`. 