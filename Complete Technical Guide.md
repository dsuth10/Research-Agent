# Deep Research API Wrapper: Complete Technical Implementation Guide

A modern, scalable web application that wraps OpenAI's Deep Research API with a robust client-side architecture. This guide provides the complete technical specification using 2025's best practices and up-to-date technologies.

## Executive Summary

The application is a **self-contained React SPA** that provides a seamless interface for OpenAI's Deep Research capabilities. It features local file management, comprehensive export options, and optional cloud integrations, all while maintaining security and performance standards appropriate for 2025.

## Technology Stack Analysis

### Core Technologies

**Build Tool**: Vite 5.x has replaced Create React App, which was officially deprecated in 2025. Vite provides significantly faster development builds, better TypeScript support, and is now the React team's recommended build tool[^1][^2][^3][^4][^5].

**Frontend Framework**: React 18 with TypeScript provides the foundation, with optional React 19 features for enhanced form handling and server components[^6][^7][^8].

**State Management**:

- **TanStack Query v5** for server state management - the industry standard with excellent caching and background synchronization
- **Zustand v4** for client state - lightweight, performant, with excellent TypeScript support, simpler than Redux for most use cases

**Form Handling**: React Hook Form v7 with Zod validation remains superior to React 19's native forms for complex validation scenarios and performance optimization.

### API Integration Strategy

The application integrates with two OpenAI models:

- **o3-deep-research-2025-06-26** for the core research functionality (\$10/1M input, \$40/1M output tokens)
- **GPT-4.1** for prompt optimization and refinement (lower cost, excellent for prompt crafting)


### File System and Export Technologies

**File System Access API** provides native browser file operations with `browser-fs-access` library as a compatibility fallback for older browsers[^21][^22][^23][^24]. For export functionality:

- **PDF generation**: pdf-lib (recommended over jsPDF for 2025) - supports both creation and modification
- **DOCX generation**: docx.js for Word document creation
- **Markdown**: Native string processing with proper formatting


## Project Architecture

### Modular Design Structure

The application follows a modular architecture with five core modules, each self-contained and communicating through shared state:

### Component Organization

The codebase is organized using modern React patterns with strict TypeScript interfaces:

## Core Application Setup

### Package Configuration

The project uses a modern dependency structure optimized for 2025 development:

### Build Configuration

Vite configuration includes comprehensive testing setup with Vitest browser mode for real browser testing:

TypeScript configuration ensures strict type checking and modern ES2020+ features:

## Application Architecture

### State Management Implementation

The Zustand store provides centralized state management with persistence and development tools:

### Main Application Structure

The root application handles provider setup, routing, and global state initialization:

Entry point configuration includes TanStack Query setup with proper error handling and retry logic:

## User Interface Components

### Layout System

The application features a responsive layout with collapsible sidebar navigation:

Header component provides global controls and status indicators:

Sidebar navigation with dynamic state indicators:

### Design System

Custom UI components follow shadcn/ui patterns with Tailwind CSS:

Utility functions provide consistent styling and data formatting:

## Core Modules Implementation

### 1. Prompt Builder Module

The Prompt Builder uses React Hook Form with Zod validation to create optimized research prompts. It features:

- Multi-step wizard interface for gathering research requirements
- Real-time token estimation and cost calculation
- Integration with GPT-4.1 for prompt optimization
- Live preview of generated prompts

Key features include form validation, token counting, and seamless integration with the research execution pipeline.

### 2. Agent Runner Module

Handles the execution of Deep Research tasks with:

- Streaming progress updates using Server-Sent Events
- Background task management with webhook support
- Real-time cost tracking and token usage monitoring
- Comprehensive error handling and retry mechanisms

The module integrates with OpenAI's responses API and manages long-running research tasks efficiently.

### 3. Results Viewer Module

Provides comprehensive result display and analysis:

- Tabbed interface for report, thought process, and sources
- Citation management and source verification
- Export functionality for multiple formats
- Interactive result exploration tools


### 4. Export \& Sync Module

Comprehensive export system supporting:

- **PDF Export**: Using pdf-lib for high-quality document generation
- **DOCX Export**: Professional Word document creation with proper formatting
- **Markdown Export**: Clean, readable markdown with proper citation formatting
- **Notion Integration**: Automated page creation in Notion databases
- **Obsidian Integration**: Direct vault synchronization with markdown files


### 5. Task Log Module

Local task management with:

- Research history persistence using browser storage
- Search and filtering capabilities
- Cost tracking and usage analytics
- Export and backup functionality


## API Integration Details

### OpenAI Service Implementation

The OpenAI service handles both prompt generation and deep research execution:

Key features include:

- Secure API key management
- Streaming support for long-running tasks
- Error handling and retry logic
- Cost calculation and usage tracking


### File System Integration

Modern File System Access API implementation with fallbacks:

## Security Considerations

### API Key Management

Client-side API keys are stored in environment variables with proper browser security:

- Keys stored in `.env.local` files (git-ignored)
- Runtime access through `import.meta.env.VITE_*` pattern
- No server-side storage required
- User controls their own OpenAI credentials


### Browser Security

- File System Access API requires user permission grants
- All file operations are sandboxed to selected directories
- No automatic file access without explicit user consent
- HTTPS required for File System Access API functionality


## Testing Strategy

### Comprehensive Testing Setup

Modern testing approach using Vitest with browser mode:

**Testing Technologies**:

- **Vitest v2** - Modern, fast test runner designed for Vite projects
- **React Testing Library** - Component testing with user-focused assertions
- **Vitest Browser Mode** - Real browser testing using Playwright
- **TypeScript Support** - Full type safety in tests

**Testing Strategy**:

- Unit tests for utility functions and business logic
- Integration tests for component interactions
- Browser tests for File System Access API functionality
- Mocked API calls for consistent testing


## Performance Optimizations

### Build Optimizations

The Vite configuration includes performance optimizations:

- Code splitting with manual chunks for vendor libraries
- Source maps for debugging
- Tree shaking for optimal bundle size
- Modern ES modules for faster loading


### Runtime Performance

- TanStack Query caching reduces API calls
- Zustand's selective subscriptions minimize re-renders
- React.memo and useMemo for expensive computations
- Lazy loading for non-critical modules


## Deployment Strategy

### Production Build

```bash
npm run build
```

Creates an optimized static build suitable for deployment on:

- Vercel (recommended for easy deployment)
- Netlify
- AWS S3 + CloudFront
- Any static hosting service


### Environment Configuration

Production deployment requires:

- HTTPS for File System Access API
- Environment variables for API keys
- CORS configuration for OpenAI API calls
- Content Security Policy for browser security


## Future Scalability

### Planned Enhancements

The architecture supports future improvements:

1. **Collaborative Features**: Y.js integration for real-time collaborative prompt editing
2. **Advanced Analytics**: Usage tracking and research quality metrics
3. **Plugin System**: Extensible architecture for custom export formats
4. **Enterprise Features**: Team management and shared research libraries
5. **AI Improvements**: Integration with newer OpenAI models as they become available

### Technical Scalability

- Modular architecture allows independent feature development
- TypeScript interfaces enable safe refactoring
- Component-based design supports micro-frontend architecture
- State management scales to complex application requirements


## Getting Started

### Development Setup

1. **Clone and Install**:
```bash
git clone <repository>
cd research-wrapper
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env.local
# Add your OpenAI API key to .env.local
```

3. **Development Server**:
```bash
npm run dev
```

4. **Testing**:
```bash
npm run test        # Unit tests
npm run test:ui     # Test UI
npm run test:browser # Browser tests
```


### Production Deployment

```bash
npm run build
npm run preview  # Preview production build locally
```


## Conclusion

This implementation provides a robust, modern foundation for wrapping OpenAI's Deep Research API. The architecture emphasizes developer experience, user security, and future scalability while leveraging 2025's best practices in React development, state management, and browser APIs.

The modular design ensures maintainability and extensibility, while the comprehensive testing strategy and TypeScript implementation provide confidence in code quality and long-term maintenance.

<div style="text-align: center">⁂</div>

[^1]: https://community.openai.com/t/deep-research-in-the-api-webhooks-and-web-search-with-o3/1299919

[^2]: https://openai.com/index/gpt-4-1/

[^3]: https://www.robinwieruch.de/react-trends/

[^4]: https://www.hyperlinkinfosystem.com/blog/vite-vs-create-react-app-a-complete-comparison

[^5]: https://dev.to/simplr_sh/why-you-should-stop-using-create-react-app-and-start-using-vite-react-in-2025-4d21

[^6]: https://www.brilworks.com/blog/future-of-reactjs/

[^7]: https://dev.to/andrewbaisden/building-modern-react-apps-in-2025-a-guide-to-cutting-edge-tools-and-tech-stacks-k8g

[^8]: https://themeselection.com/react-ecosystem/

[^9]: https://tanstack.com/query

[^10]: https://github.com/TanStack/query

[^11]: https://www.youtube.com/watch?v=w9r55wd2CAk

[^12]: https://swansoftwaresolutions.com/mobx-vs-redux-vs-zustand-which-state-manager-to-choose-in-2025/

[^13]: https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k

[^14]: https://www.linkedin.com/pulse/state-management-2025-redux-zustand-react-query-sbtqc

[^15]: https://dev.to/joodi/modern-react-state-management-in-2025-a-practical-guide-2j8f

[^16]: https://www.foo.software/posts/form-handling-in-2025-why-react-19-triumphs-over-formik-and-hook-form

[^17]: https://blog.logrocket.com/react-hook-form-vs-react-19/

[^18]: https://www.udemy.com/course/react-hook-form-the-complete-guide-with-react-js/

[^19]: https://codeparrot.ai/blogs/react-hook-form-for-beginners

[^20]: https://www.datacamp.com/tutorial/o3-api

[^21]: https://github.com/GoogleChromeLabs/browser-fs-access

[^22]: https://css-tricks.com/getting-started-with-the-file-system-access-api/

[^23]: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access

[^24]: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API

[^25]: https://joyfill.io/blog/comparing-open-source-pdf-libraries-2025-edition

[^26]: https://pdforge.com/blog/popular-libraries-2025-for-pdf-generation-using-node-js

[^27]: https://substack.com/home/post/p-151808104

[^28]: https://www.nutrient.io/blog/top-js-pdf-libraries/

[^29]: https://www.thatsoftwaredude.com/content/14087/top-javascript-pdf-libraries

[^30]: RoughPlan.md

[^31]: https://apidog.com/blog/how-to-use-the-gpt-4-1-api/

[^32]: https://openai.com/index/introducing-deep-research/

[^33]: https://apidog.com/blog/openai-o3-models/

[^34]: https://platform.openai.com/docs/api-reference

[^35]: https://apidog.com/blog/openai-deep-research-api/

[^36]: https://platform.openai.com/docs/models/o3-mini

[^37]: https://wandb.ai/onlineinference/gpt-python/reports/GPT-4-1-Python-quickstart-using-the-OpenAI-API--VmlldzoxMjYyNTUyOA

[^38]: https://aiengineerguide.com/blog/openai-deep-research-api/

[^39]: https://platform.openai.com/docs/models/o3

[^40]: https://cookbook.openai.com/examples/deep_research_api/introduction_to_deep_research_api

[^41]: https://help.openai.com/en/articles/10362446-api-access-to-o1-o3-and-o4-models

[^42]: https://platform.openai.com/docs/models/gpt-4.1

[^43]: https://cookbook.openai.com/examples/deep_research_api/introduction_to_deep_research_api_agents

[^44]: https://platform.openai.com/docs/models/o3-pro

[^45]: https://openrouter.ai/openai/gpt-4.1

[^46]: https://openai.com/index/deep-research/

[^47]: https://platform.openai.com/docs/models

[^48]: https://www.linkedin.com/pulse/create-react-app-vs-vite-development-whats-better-2025-arunava-guha-85qgc

[^49]: https://www.lambdatest.com/web-technologies/native-filesystem-api

[^50]: https://www.corbado.com/blog/vite-react

[^51]: https://blog.isquaredsoftware.com/2025/06/react-community-2025/

[^52]: https://webkit.org/blog/12257/the-file-system-access-api-with-origin-private-file-system/

[^53]: https://react.dev/blog/2025/02/14/sunsetting-create-react-app

[^54]: https://www.angularminds.com/blog/react-ecosystem

[^55]: https://www.reddit.com/r/reactjs/comments/1e8q7f3/create_react_app_vs_nextjs_vs_vite/

[^56]: https://react.dev

[^57]: https://caniuse.com/native-filesystem-api

[^58]: https://docxtemplater.com

[^59]: https://www.simple.ink/guides/top-notion-integrations-to-supercharge-your-setup-in-2025

[^60]: https://github.com/Amberg/DocxTemplater

[^61]: https://www.whalesync.com/blog/notion-api-guide-

[^62]: https://jsreport.net/learn/docxtemplater

[^63]: https://www.notion.com/help/create-integrations-with-the-notion-api

[^64]: https://community.monday.com/t/introducing-docx-templater-app/80475

[^65]: https://noteapiconnector.com/notion-integrations

[^66]: https://blog.docxtemplater.com

[^67]: https://developers.notion.com/docs/create-a-notion-integration

[^68]: https://www.capterra.com/p/10026790/docxtemplater/

[^69]: https://slashdot.org/software/comparison/PDF-LIB-vs-jsPDF/

[^70]: https://developers.notion.com

[^71]: https://www.capterra.com.au/alternatives/1073367/docxtemplater

[^72]: https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p

[^73]: https://zerotomastery.io/blog/react-query/

[^74]: https://www.reddit.com/r/react/comments/1lkwcyc/best_practices_for_react_with_next_and_zustand_in/

[^75]: https://www.reddit.com/r/nextjs/comments/1i0zzsj/should_i_use_tanstack_query/

[^76]: https://react-hook-form.com

[^77]: https://dev.to/rigalpatel001/react-query-or-swr-which-is-best-in-2025-2oa3

[^78]: https://github.com/pmndrs/zustand

[^79]: https://react-hook-form.com/get-started

[^80]: https://dev.to/andrewbaisden/how-to-build-modern-react-apps-with-the-tanstack-suite-in-2025-5fed

[^81]: https://www.nimblechapps.com/blog/15-react-state-management-libraries-to-use-in-2025

[^82]: https://blog.incubyte.co/blog/vitest-react-testing-library-guide/

[^83]: https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb

[^84]: https://www.linkedin.com/pulse/advanced-javascript-modules-explained-building-clean-reusable-r-7ngcc

[^85]: https://dev.to/samuel_kinuthia/testing-react-applications-with-vitest-a-comprehensive-guide-2jm8

[^86]: https://blogs.perficient.com/2025/03/05/using-typescript-with-react-best-practices/

[^87]: https://dev.to/omriluz1/module-federation-in-modern-javascript-3lpl

[^88]: https://www.udemy.com/course/typescript-with-react-jest-testing/

[^89]: https://www.bacancytechnology.com/blog/typescript-best-practices

[^90]: https://www.sitepoint.com/anatomy-of-a-modern-javascript-application/

[^91]: https://javascript.plainenglish.io/jest-vs-vitest-in-a-react-project-which-one-should-you-use-in-2025-2c254ddfd6f8

[^92]: https://www.telerik.com/blogs/react-design-patterns-best-practices

[^93]: https://dev.to/omriluz1/best-practices-for-javascript-modularization-22b6

[^94]: https://www.epicweb.dev/events/react-component-testing-with-vitest-browser-mode-02-2025

[^95]: https://www.devacetech.com/insights/react-best-practices

[^96]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

[^97]: https://www.reddit.com/r/node/comments/1ioguv6/is_vitest_still_necessary_in_2025/

[^98]: https://javascript.plainenglish.io/how-i-engineered-a-modular-javascript-micro-frontend-architecture-from-scratch-and-why-you-might-23bf814b4ca2

[^99]: https://www.youtube.com/watch?v=U24H2mLwhgc

[^100]: https://www.linkedin.com/pulse/reactts-development-best-practices-aaron-j-mccullough-pm7ee

[^101]: https://elephas.app/blog/obsidian-guide

[^102]: https://superuser.com/questions/1833341/how-to-safely-store-environmental-variables-and-make-it-actually-invisible-in-my

[^103]: https://infosecwriteups.com/jwt-security-in-2025-are-we-finally-free-from-leaks-3552fce24690

[^104]: https://www.stephanmiller.com/sync-obsidian-vault-across-devices/

[^105]: https://www.nodejs-security.com/blog/do-not-use-secrets-in-environment-variables-and-here-is-how-to-do-it-better

[^106]: https://ssojet.com/blog/jwt-security-in-2025-critical-vulnerabilities-every-b2b-saas-company-must-know/

[^107]: https://www.reddit.com/r/ObsidianMD/comments/1i7i4gm/refreshed_vault_for_2025_simple_structure_aidriven/

[^108]: https://serverfault.com/questions/892481/what-are-the-advantages-of-putting-secret-values-of-a-website-as-environment-var

[^109]: https://curity.io/resources/learn/jwt-best-practices/

[^110]: https://www.linkedin.com/pulse/new-way-sync-your-obsidian-vault-silvano-cerza-cnkcf

[^111]: https://stackoverflow.com/questions/12461484/is-it-secure-to-store-passwords-as-environment-variables-rather-than-as-plain-t

[^112]: https://www.ietf.org/archive/id/draft-sheffer-oauth-rfc8725bis-00.html

[^113]: https://www.obsidianstats.com/posts/2025-07-06-weekly-updates

[^114]: https://www.reddit.com/r/selfhosted/comments/1clv8ey/why_are_environment_variables_considered_more/

[^115]: https://www.vaadata.com/blog/jwt-json-web-token-vulnerabilities-common-attacks-and-security-best-practices/

[^116]: https://www.youtube.com/watch?v=YQeBaX8-Ux8

[^117]: https://www.trendmicro.com/en_au/research/22/h/analyzing-hidden-danger-of-environment-variables-for-keeping-secrets.html

[^118]: https://www.permit.io/blog/how-to-use-jwts-for-authorization-best-practices-and-common-mistakes

[^119]: https://www.obsidianstats.com/posts/2025-04-13-weekly-plugin-updates

[^120]: https://vercel.com/docs/environment-variables/sensitive-environment-variables

[^121]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/23f3c45f.tsx

[^122]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/71bfe781.tsx

[^123]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/48322294.tsx

[^124]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/dcfc1898.tsx

[^125]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/485ba106.css

[^126]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/75838095.ts

[^127]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/61ee70fc.tsx

[^128]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/a369d17a.tsx

[^129]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/4aeff75f-a1e2-4338-a1a5-fd40245fed8c/0eb54730.html

[^130]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/bc10579c-0dbd-4c46-96e2-e4fd047d6e4c/b52e4ae6.ts

[^131]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/bc10579c-0dbd-4c46-96e2-e4fd047d6e4c/092556c5.ts

[^132]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/bc10579c-0dbd-4c46-96e2-e4fd047d6e4c/159ecaa6.ts

[^133]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/bc10579c-0dbd-4c46-96e2-e4fd047d6e4c/8033e9b8.ts

[^134]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/387bcd20-fb39-43fe-b01e-85fd4970de18/bfe5fcdc.ts

[^135]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/d673373b-b1a4-4261-9daa-fe7772c10285/6a3b01ba.ts

[^136]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/d673373b-b1a4-4261-9daa-fe7772c10285/fe25c593.json

[^137]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/d673373b-b1a4-4261-9daa-fe7772c10285/b55cdbef.json

[^138]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/d673373b-b1a4-4261-9daa-fe7772c10285/ddc1067f.js

[^139]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/d673373b-b1a4-4261-9daa-fe7772c10285/a3046da0.example

[^140]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/72bae17b-1447-4ae1-95a2-feb0d4ee6e14/7ae45ad1.json

[^141]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/63dfb89d-0329-43b2-ac12-696a25c0ed4a/77393d4e.json

[^142]: https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/5e8e7765ce5e9326e00491bdca4275d3/14bdc0b1-5e70-4955-9bc4-211f55696a87/1761914e.json

