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

## Phase 2: Data Layer & State Management ⬅️ NEXT PHASE

### 2.1 TypeScript Types

✅ Already completed in Phase 1:
- `Message`, `ChatSession`, `ThinkingStep`, `ToolCall`
- `Artifact` with metadata (id, title, content, tags, createdAt, updatedAt)
- `Workflow`, `WorkflowRun`, `WorkflowStatus`

### 2.2 Context Providers

- `ChatProvider`: Manage chat sessions, messages, current session
- `ArtifactProvider`: CRUD operations, artifact list
- `WorkflowProvider`: Available workflows, run history

### 2.3 API Routes (Next.js Route Handlers)

```
/api/chat/[sessionId]         (GET, POST, DELETE)
/api/artifacts                (GET, POST)
/api/artifacts/[id]           (GET, PUT, DELETE)
/api/workflows                (GET)
/api/workflows/[id]/run       (POST)
/api/workflows/runs/[runId]   (GET)
```

### 2.4 Storage Abstraction

Create storage adapters with clean interfaces:
- `ChatStorage`: persist messages and sessions
- `ArtifactStorage`: CRUD for markdown docs
- `WorkflowStorage`: store run history

**Implementation Strategy:**
- Start with file system (JSON files in a `data/` directory)
- Design with interface/adapter pattern for easy migration
- Future: swap to Postgres, SQLite, or other database

---

## Phase 3: AI Integration (Chat)

### 3.1 AI SDK Setup

- Install Vercel AI SDK (`ai` package)
- Configure AI provider (OpenAI, Anthropic, etc.)
- Set up environment variables for API keys
- Implement streaming responses

### 3.2 Chat Backend

- Implement POST `/api/chat/[sessionId]` with streaming support
- Message persistence to storage
- System prompts management
- Context window management

### 3.3 Advanced Chat Features

- Tool/function calling display in UI
- Thinking steps visualization
- Regenerate response button
- Edit and retry message
- Export conversation

---

## Phase 4: Artifacts Integration

### 4.1 Agent Access to Artifacts

- Provide tool/function for agent to read artifacts by ID or search
- Provide tool/function for agent to create new artifacts
- Provide tool/function for agent to update existing artifacts
- Implement version history for artifacts (optional)

### 4.2 Linking Chat & Artifacts

- Reference artifacts in chat messages (e.g., `[artifact:id]` syntax)
- Create artifact from chat button
- Open artifact from chat reference (clickable links)
- Show artifact preview in chat when referenced

---

## Phase 5: Workflows Integration

### 5.1 Temporal Setup

- Install Temporal SDK (`@temporalio/client`, `@temporalio/worker`)
- Set up local Temporal server (docker-compose.yml)
- Create sample workflows (e.g., data processing, report generation)
- Create worker to execute workflows

### 5.2 Workflow Execution

- API route to trigger workflows with parameters
- Stream workflow status updates via Server-Sent Events or polling
- Store workflow results in artifact storage automatically
- Handle workflow failures gracefully

### 5.3 Agent-Workflow Integration

- Agent can trigger workflows via tool/function
- Agent can read workflow results from artifacts
- Display workflow runs in chat context when triggered
- Notify in chat when workflow completes

---

## Phase 6: Polish & Extensibility

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

- **Phase**: Phase 1 Complete ✅ - Moving to Phase 2
- **Completed**: Full UI scaffolding with all three main features (Chat, Artifacts, Workflows)
- **Next Steps**:
  1. Set up API routes for data persistence
  2. Implement storage abstraction layer
  3. Add React Context providers for state management
  4. Prepare for AI SDK integration
- **Development Server**: Running at http://localhost:3000
- **Node Version**: 20.20.0 (required by Next.js 16)

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
