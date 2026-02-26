# AI MVP Template - Implementation Plan

## Overview

Building a flexible AI application template with three core features:

- **Chat**: Agent conversations with message history, thinking steps, and tool call visualization
- **Artifacts**: CRUD for markdown documents with durable storage and agent access
- **Workflows**: Temporal workflow integration with run history and results storage

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **State Management**: React Context + hooks (lightweight for MVP)
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Storage**: Start with local API routes + file system, design for easy swap to database
- **Workflows**: Temporal SDK for TypeScript
- **AI Integration**: Vercel AI SDK (framework agnostic, supports streaming)

---

## Phase 1: UI Scaffolding ✅ COMPLETED

### 1.1 Setup Foundation

- [x] Install shadcn/ui and configure base components
- [x] Set up design system (colors, typography, spacing)
- [x] Create base layout with navigation structure
- [x] Implement routing for three main sections: `/chat`, `/artifacts`, `/workflows`

### 1.2 Component Architecture

```
src/
├── app/
│   ├── layout.tsx              (Root layout with nav)
│   ├── page.tsx                (Landing/dashboard)
│   ├── chat/
│   │   └── page.tsx            (Chat interface)
│   ├── artifacts/
│   │   ├── page.tsx            (Artifact list)
│   │   └── [id]/
│   │       └── page.tsx        (Artifact detail/edit)
│   └── workflows/
│       ├── page.tsx            (Workflow list)
│       └── [id]/
│           └── page.tsx        (Workflow run details)
├── components/
│   ├── ui/                     (shadcn components)
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   ├── Message.tsx
│   │   ├── MessageInput.tsx
│   │   └── ThinkingIndicator.tsx
│   ├── artifacts/
│   │   ├── ArtifactList.tsx
│   │   ├── ArtifactCard.tsx
│   │   ├── ArtifactEditor.tsx   (Markdown editor)
│   │   └── ArtifactViewer.tsx   (Rendered markdown)
│   ├── workflows/
│   │   ├── WorkflowList.tsx
│   │   ├── WorkflowCard.tsx
│   │   ├── WorkflowRunner.tsx
│   │   └── WorkflowRunHistory.tsx
│   └── layout/
│       ├── Navigation.tsx
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   ├── types.ts               (Shared TypeScript types)
│   └── utils.ts               (Helper functions)
└── hooks/                     (Custom React hooks)
```

### 1.3 Chat UI Components

**Goal**: Build the visual structure for conversations

**Components to build:**
- **ChatContainer**: Main chat layout (sidebar for sessions + message area)
- **MessageList**: Scrollable message container with auto-scroll
- **Message**: Individual message bubble (user vs assistant, markdown support)
- **MessageInput**: Textarea with send button, auto-resize
- **ThinkingIndicator**: Animated dots or skeleton for loading states
- **ToolCallDisplay**: Collapsible section showing tool invocations (future)

**Features:**
- Message threading/sessions list
- New chat button
- Message timestamps
- Copy message button
- Markdown rendering in messages

### 1.4 Artifacts UI Components

**Goal**: CRUD interface for markdown documents

**Components to build:**
- **ArtifactList**: Grid or list view of all artifacts
- **ArtifactCard**: Preview card with title, excerpt, metadata
- **ArtifactEditor**: Markdown editor (consider react-markdown-editor-lite or similar)
- **ArtifactViewer**: Read-only rendered markdown view
- **ArtifactHeader**: Title, tags, created/modified dates

**Features:**
- Search/filter artifacts
- Create new artifact button
- Edit/Delete actions
- Split view (edit + preview)
- Tag system for organization
- Export to file

### 1.5 Workflows UI Components

**Goal**: Interface to manage and run Temporal workflows

**Components to build:**
- **WorkflowList**: Available workflows with descriptions
- **WorkflowCard**: Workflow name, description, last run status
- **WorkflowRunner**: Form to input parameters and start workflow
- **WorkflowRunHistory**: Table of past runs with status
- **WorkflowRunDetail**: Full run details, logs, results

**Features:**
- Run workflow button with parameter form
- Real-time status updates (pending, running, completed, failed)
- View run results
- Re-run with same parameters
- Filter runs by status/date

### 1.6 Navigation & Layout

- Top navigation or sidebar with links to Chat, Artifacts, Workflows
- Responsive design (mobile-friendly)
- Dark mode support (Tailwind dark: classes)
- Breadcrumbs for nested pages

### Phase 1 Task Breakdown

1. ✅ **Install and configure shadcn/ui** (Button, Card, Input, Textarea, Tabs, Dialog, Label, Table, etc.)
2. ✅ **Create base layout** with navigation structure
3. ✅ **Build Chat UI** (all components, no backend yet)
4. ✅ **Build Artifacts UI** (all components, no backend yet)
5. ✅ **Build Workflows UI** (all components, no backend yet)
6. ✅ **Implement routing** and link everything together
7. ✅ **Add mock data** to visualize the full UI flow

### Phase 1 Completion Summary

**What Was Built:**

#### Foundation & Layout
- Installed shadcn/ui with 15+ components (Button, Card, Input, Textarea, Tabs, Dialog, Label, Table, ScrollArea, Separator, Badge, Avatar)
- Created `src/components/layout/Navigation.tsx` - Responsive navigation with active state
- Updated `src/app/layout.tsx` with navigation and container structure
- Built landing page at `src/app/page.tsx` with feature cards

#### Chat Interface (`src/components/chat/`)
- `ChatContainer.tsx` - Main chat layout with session sidebar and message area
- `MessageList.tsx` - Auto-scrolling message container
- `Message.tsx` - Message bubbles with copy functionality and timestamp
- `MessageInput.tsx` - Text input with keyboard shortcuts (Enter to send, Shift+Enter for new line)
- `ThinkingIndicator.tsx` - Animated loading indicator
- Full session management with mock data

#### Artifacts Management (`src/components/artifacts/`)
- `ArtifactList.tsx` - Grid view with search functionality
- `ArtifactCard.tsx` - Preview cards with tags and action buttons
- `ArtifactEditor.tsx` - Modal editor with edit/preview tabs for markdown
- `ArtifactViewer.tsx` - Read-only artifact viewer
- Complete CRUD operations with mock data

#### Workflows Interface (`src/components/workflows/`)
- `WorkflowList.tsx` - Available workflows in grid layout
- `WorkflowCard.tsx` - Workflow cards with run button
- `WorkflowRunner.tsx` - Parameter input dialog with JSON validation
- `WorkflowRunHistory.tsx` - Table view of workflow runs with status badges
- `WorkflowRunDetail.tsx` - Detailed run view with parameters and results
- Status tracking (pending, running, completed, failed)

#### Type System (`src/lib/types.ts`)
- Complete TypeScript type definitions for:
  - Chat: `Message`, `ChatSession`, `ThinkingStep`, `ToolCall`
  - Artifacts: `Artifact` with metadata
  - Workflows: `Workflow`, `WorkflowRun`, `WorkflowStatus`

**Current State:**
- Development server running at http://localhost:3000
- All three main features are navigable and functional with mock data
- UI is fully responsive and ready for backend integration

---

## Phase 2: Data Layer & State Management ✅ COMPLETED

### 2.1 TypeScript Types

✅ Completed in Phase 1:
- `Message`, `ChatSession`, `ThinkingStep`, `ToolCall`
- `Artifact` with metadata (id, title, content, tags, createdAt, updatedAt)
- `Workflow`, `WorkflowRun`, `WorkflowStatus`

### 2.2 Context Providers

✅ Implemented:
- [x] `ChatProvider`: Manage chat sessions, messages, current session
- [x] `ArtifactProvider`: CRUD operations, artifact list
- [x] `WorkflowProvider`: Available workflows, run history
- [x] `AppProviders`: Combined provider wrapper for root layout

### 2.3 API Routes (Next.js Route Handlers)

✅ Implemented:
```
/api/chat/sessions                           (GET, POST)
/api/chat/sessions/[sessionId]               (GET, DELETE, PATCH)
/api/chat/sessions/[sessionId]/messages      (GET, POST)
/api/artifacts                               (GET, POST)
/api/artifacts/[id]                          (GET, PUT, DELETE)
/api/workflows                               (GET)
/api/workflows/[id]                          (GET)
/api/workflows/[id]/run                      (POST)
/api/workflows/runs                          (GET)
/api/workflows/runs/[runId]                  (GET)
```

### 2.4 Storage Abstraction

✅ Implemented:
- [x] `ChatStorage` interface and `FileSystemChatStorage` implementation
- [x] `ArtifactStorage` interface and `FileSystemArtifactStorage` implementation
- [x] `WorkflowStorage` interface and `FileSystemWorkflowStorage` implementation
- [x] File system backend using JSON files in `data/` directory
- [x] Interface/adapter pattern for easy database migration

### Phase 2 Completion Summary

**What Was Built:**

#### Storage Layer (`src/lib/storage/`)
- `interfaces.ts` - TypeScript interfaces for all storage operations
- `filesystem.ts` - File system implementations using JSON storage
- `index.ts` - Singleton storage instances and exports
- All data persisted to `data/` directory with automatic directory creation

#### Context Providers (`src/contexts/`)
- `ChatContext.tsx` - Chat state management with session and message operations
- `ArtifactContext.tsx` - Artifact CRUD operations with search
- `WorkflowContext.tsx` - Workflow execution and run management with polling
- `index.tsx` - Combined `AppProviders` component wrapping all contexts

#### API Routes (`src/app/api/`)
- **Chat APIs**: Full CRUD for sessions and messages
- **Artifact APIs**: Complete CRUD with search support via query params
- **Workflow APIs**: Workflow listing, execution, and run status tracking
- Mock AI responses in chat (to be replaced in Phase 3)
- Simulated workflow execution with status updates

#### UI Integration
- Updated all page components to use context providers instead of mock data
- Chat page connects to `ChatContext` for real message persistence
- Artifacts page uses `ArtifactContext` for CRUD operations
- Workflows page integrates `WorkflowContext` with auto-polling for running workflows
- Root layout wraps entire app with `AppProviders`

**Current State:**
- All three features now persist data across browser sessions
- File system storage fully functional
- Easy to swap to database by implementing storage interfaces
- Development server running successfully at http://localhost:3000

---

## Phase 3: AI Integration (Chat) ✅ COMPLETED

### 3.1 AI SDK Setup

✅ Implemented:
- [x] Install Vercel AI SDK (`ai` package) and Anthropic provider (`@ai-sdk/anthropic`)
- [x] Configure Anthropic as AI provider
- [x] Set up environment variables for API keys (`.env.local`, `.env.example`)
- [x] Implement streaming responses via `/api/chat/stream`

### 3.2 Chat Backend

✅ Implemented:
- [x] Implement POST `/api/chat/stream` with streaming support using AI SDK
- [x] Message persistence to storage (user messages before streaming, assistant messages after completion)
- [x] Conversation history context management
- [x] Optimistic UI updates during streaming

### 3.3 Advanced Chat Features

✅ Implemented:
- [x] Thinking steps visualization (collapsible UI component)
- [x] Tool/function calling display in UI (collapsible with formatted JSON)

🔄 Pending (Phase 4+):
- Regenerate response button
- Edit and retry message
- Export conversation

### Phase 3 Completion Summary

**What Was Built:**

#### AI Integration (`src/app/api/chat/stream/route.ts`)
- Created streaming endpoint using Vercel AI SDK with Anthropic's Claude 3.5 Sonnet
- Implemented proper message persistence (saves user message first, then assistant response after completion)
- Uses Node.js runtime for filesystem access compatibility
- Error handling for missing API keys and failed requests

#### Updated Context Provider (`src/contexts/ChatContext.tsx`)
- Added `streaming` state to track AI response generation
- Implemented optimistic UI updates with temporary message IDs
- Stream parsing logic to handle AI SDK data stream format
- Automatic reload of messages after streaming to get saved versions

#### Enhanced Message Component (`src/components/chat/Message.tsx`)
- Collapsible thinking steps visualization with icon and count
- Collapsible tool calls display with formatted JSON
- Support for both thinking steps and tool call metadata
- Visual indicators (lightbulb for thinking, wrench for tools)

#### Environment Configuration
- Created `.env.local` with Anthropic API key configuration
- Created `.env.example` as documentation template
- Both files properly gitignored

#### TypeScript Fixes
- Fixed all Date type inconsistencies across storage layer
- Fixed TypeScript errors in workflow and message components
- Removed invalid workflow parameters from default data

**Current State:**
- Real AI chat functionality is fully operational
- Messages stream from Claude 3.5 Sonnet in real-time
- All conversations persist to filesystem storage
- UI shows streaming indicator during AI responses
- Build completes successfully with no TypeScript errors
- Ready to test end-to-end with dev server

---

## Phase 4: Artifacts Integration ✅ COMPLETED

### 4.1 Agent Access to Artifacts

✅ Implemented:
- [x] Tool for agent to search artifacts by query string
- [x] Tool for agent to read artifacts by ID
- [x] Tool for agent to create new artifacts with title, content, and tags
- [x] Tool for agent to update existing artifacts (title, content, or tags)

### 4.2 Linking Chat & Artifacts

✅ Implemented:
- [x] Reference artifacts in chat messages using `[artifact:id]` or `[artifact:id|display text]` syntax
- [x] Parse and render artifact references as clickable links in Message component
- [x] Open artifact from chat reference (links to `/artifacts?id={artifactId}`)
- [x] Show artifact preview in chat when referenced (expandable with title, content excerpt, and tags)

### Phase 4 Completion Summary

**What Was Built:**

#### AI Tools for Artifacts ([src/app/api/chat/stream/route.ts](src/app/api/chat/stream/route.ts))
- **searchArtifacts**: Search for artifacts by query string (searches in title, content, and tags)
- **getArtifact**: Get a specific artifact by ID to read its full content
- **createArtifact**: Create a new artifact with title, content, and optional tags
- **updateArtifact**: Update an existing artifact (title, content, and/or tags)
- Tool calls and results are saved in message metadata for display in UI

#### Artifact Reference Parsing ([src/lib/utils.ts](src/lib/utils.ts))
- `parseArtifactReferences()`: Extract artifact references from text using regex
- `segmentTextWithArtifacts()`: Split text into segments with artifact references identified
- Supports two formats:
  - `[artifact:id]` - Simple reference with default "artifact" display text
  - `[artifact:id|Custom Name]` - Reference with custom display text

#### Artifact Link Component ([src/components/chat/ArtifactLink.tsx](src/components/chat/ArtifactLink.tsx))
- Renders artifact references as clickable links
- Shows "not found" message for invalid artifact IDs
- Expandable preview showing:
  - Artifact title
  - Content excerpt (first 300 characters)
  - Tags with badges
- Links to artifact detail page with ID in query params

#### Enhanced Message Component ([src/components/chat/Message.tsx](src/components/chat/Message.tsx))
- Parses message content for artifact references
- Renders text segments with embedded ArtifactLink components
- Maintains existing functionality (thinking steps, tool calls, copy button)

**Current State:**
- AI agent can now perform full CRUD operations on artifacts during conversations
- Users can reference artifacts in chat using simple syntax
- Artifact references are interactive and show previews
- All features build successfully with TypeScript
- Ready for Phase 5: Workflows Integration

---

## Phase 5: Workflows Integration ✅ COMPLETED

### 5.1 Temporal Setup

✅ Implemented:
- [x] Install Temporal SDK (`@temporalio/client`, `@temporalio/worker`, `@temporalio/workflow`, `@temporalio/activity`)
- [x] Set up local Temporal server (docker-compose.yml with PostgreSQL, Temporal server, and Web UI)
- [x] Create sample workflows (data processing, report generation, long-running processing)
- [x] Create worker to execute workflows with proper configuration

### 5.2 Workflow Execution

✅ Implemented:
- [x] Updated API route to trigger real Temporal workflows with parameters
- [x] Workflow status updates via polling (existing context provider)
- [x] Automatic storage of workflow results as artifacts (when result contains `content` field)
- [x] Graceful workflow failure handling with error logging and status updates

### 5.3 Agent-Workflow Integration

✅ Implemented:
- [x] Agent can trigger workflows via `runWorkflow` tool
- [x] Agent can list available workflows via `listWorkflows` tool
- [x] Agent can check workflow status via `getWorkflowRun` tool
- [x] Workflow results automatically stored as artifacts for agent access
- [x] Tool responses include workflow run IDs for status tracking

### Phase 5 Completion Summary

**What Was Built:**

#### Temporal Infrastructure
- **docker-compose.yml**: Complete Temporal stack with PostgreSQL, Temporal server (ports 7233, 8233), and Web UI (port 8080)
- **Worker** ([src/temporal/worker.ts](src/temporal/worker.ts)): Standalone Node.js process that executes workflows and activities
- **Client** ([src/temporal/client.ts](src/temporal/client.ts)): Singleton client for API routes to start workflows
- **Package Scripts**: Added `npm run worker` command to start the Temporal worker

#### Workflows ([src/temporal/workflows/index.ts](src/temporal/workflows/index.ts))
1. **dataProcessingWorkflow**: Process text with operations (uppercase, lowercase, reverse, wordcount)
2. **reportGenerationWorkflow**: Fetch data and generate markdown/JSON reports
3. **longRunningWorkflow**: Process large datasets in chunks with optional reporting

#### Activities ([src/temporal/activities/index.ts](src/temporal/activities/index.ts))
- `processData`: Text transformation operations
- `generateReport`: Report generation in markdown or JSON
- `processLargeDataset`: Chunked data processing simulation
- `fetchExternalData`: External data fetching (mocked for demo)

#### API Integration ([src/app/api/workflows/[id]/run/route.ts](src/app/api/workflows/[id]/run/route.ts))
- Updated to use real Temporal client instead of mock execution
- Async workflow execution with status tracking
- Error handling and failure status updates
- Automatic artifact creation for workflow results

#### AI Agent Tools ([src/app/api/chat/stream/route.ts](src/app/api/chat/stream/route.ts))
- **listWorkflows**: Returns all available workflows with descriptions
- **runWorkflow**: Starts workflow execution with parameters, returns run ID
- **getWorkflowRun**: Checks workflow run status and retrieves results
- Automatic artifact creation when workflow results contain content

#### Storage Updates ([src/lib/storage/filesystem.ts](src/lib/storage/filesystem.ts))
- Updated default workflows to match Temporal workflow definitions:
  - `data-processing`: Text processing operations
  - `report-generation`: Report generation from data sources
  - `long-running-processing`: Large dataset processing

#### Documentation
- **README-TEMPORAL.md**: Comprehensive guide covering:
  - Quick start instructions
  - Available workflows with parameter examples
  - Chat prompts for using workflows with AI agent
  - Architecture and data flow diagrams
  - Development guide for adding new workflows
  - Troubleshooting and production deployment

#### Environment Configuration
- Added `TEMPORAL_ADDRESS` to `.env.example` (defaults to `localhost:7233`)

**Current State:**
- Temporal server runs via Docker Compose
- Worker executes workflows on `ai-template-workflows` task queue
- AI agent can discover, trigger, and monitor workflows
- Workflow results automatically become artifacts
- Web UI available at http://localhost:8080 for monitoring
- All workflows tested and operational

**Note:** Requires Node.js 20+ (as specified in .nvmrc). Use `nvm use` to switch to correct version.

---

## Phase 6: Polish & Extensibility ⬅️ NEXT PHASE

### 6.1 Configuration System

- Environment-based config (`.env.local`, `.env.production`)
- Feature flags (enable/disable chat, artifacts, workflows)
- Pluggable storage backends (filesystem, postgres, etc.)
- Pluggable AI providers (OpenAI, Anthropic, local models)

### 6.2 Developer Experience

- Clear README with setup instructions
- Example workflows with documentation
- Example agent prompts/tools
- Migration guides for storage backends
- Contributing guidelines

### 6.3 Production Readiness

- Error boundaries for graceful error handling
- Loading states and skeletons
- Comprehensive error handling and user feedback
- Authentication system (optional, make it pluggable)
- Rate limiting for API routes
- Structured logging
- Health check endpoints
- Docker support for deployment

---

## Design Principles

1. **Generic & Extensible**: Easy to swap storage, AI providers, add new features
2. **Type-Safe**: Comprehensive TypeScript types throughout
3. **UI First**: Build and validate UI/UX before complex backend logic
4. **Separation of Concerns**: Clear boundaries between UI, business logic, storage
5. **Developer Friendly**: Clear patterns, good documentation, easy to understand
6. **Production Ready**: Error handling, loading states, responsive design

---

## Current Status

- **Phase**: Phase 5 Complete ✅ - Moving to Phase 6
- **Completed**:
  - Phase 1: Full UI scaffolding with all three main features
  - Phase 2: Data layer, state management, and API routes
  - Phase 3: AI integration with streaming chat responses
  - Phase 4: Artifacts integration with AI agent and chat linking
  - Phase 5: Temporal workflows integration with AI agent tools
- **Features Working**:
  - Chat: Real AI conversations with Claude Opus 4.6, streaming responses, session management, artifact tools, workflow tools
  - Artifacts: Full CRUD operations with search, AI agent access, chat references with previews, automatic creation from workflow results
  - Workflows: Real Temporal workflow execution with three sample workflows, AI agent integration, status tracking, automatic artifact creation
- **Services**:
  - Next.js App: http://localhost:3000 (user-managed)
  - Temporal Server: localhost:7233 (gRPC), localhost:8233 (HTTP)
  - Temporal Web UI: http://localhost:8080
  - Temporal Worker: `npm run worker` (separate process)
- **Next Steps**:
  1. Polish UI/UX with error boundaries and loading states
  2. Add comprehensive documentation (README, setup guides)
  3. Implement configuration system for feature flags
  4. Add production-ready features (auth, rate limiting, logging)
  5. Create Docker support for easy deployment
- **Node Version**: 20.20.0 (required by Next.js 16) - Use `nvm use` to switch
- **Data Storage**: File system (JSON) in `data/` directory
- **AI Provider**: Anthropic Claude Opus 4.6 via Vercel AI SDK
- **Workflow Engine**: Temporal (docker-compose setup)

---

## Future Enhancements (Post-MVP)

- Multi-user support with authentication
- Real-time collaboration on artifacts
- Artifact versioning and history
- Advanced workflow scheduling (cron-style)
- Workflow templates library
- Agent memory/context persistence
- File upload support for artifacts
- Export workflows as code
- Metrics and analytics dashboard
- Plugin system for custom tools/workflows
