# Quick Start Guide

Get the AI MVP template running in 5 minutes on macOS!

## Prerequisites

- **Node.js 20+** (required for Next.js 16)
- **Temporal CLI** (install with `brew install temporal`)
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

## Step 1: Install Dependencies

```bash
# Switch to Node 20 (if using nvm)
nvm use

# Install packages
npm install

# Install Temporal CLI
brew install temporal
```

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local and add your Anthropic API key
# ANTHROPIC_API_KEY=sk-ant-...
```

## Step 3: Start Services (3 Terminals)

### Terminal 1: Temporal Server

```bash
temporal server start-dev
```

Web UI will be available at [http://localhost:8233](http://localhost:8233).

### Terminal 2: Temporal Worker

```bash
npm run worker
```

Wait for "Temporal worker starting..." message.

### Terminal 3: Next.js App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What You Can Do Now

### 1. Chat with AI
- Go to [/chat](http://localhost:3000/chat)
- Start a conversation with Claude
- Try: "What can you help me with?"

### 2. Manage Artifacts
- Try: "Create an artifact with a list of my favorite books"
- Go to [/artifacts](http://localhost:3000/artifacts) to see it
- Agent can search, create, read, and update artifacts

### 3. Run Workflows
- Try: "What workflows are available?"
- Try: "Run the data processing workflow to convert 'hello world' to uppercase"
- Try: "Generate a report from sales-api data"
- Go to [/workflows](http://localhost:3000/workflows) to see run history

### 4. Link Everything Together
- Workflows automatically create artifacts with results
- Reference artifacts in chat: `Check out [artifact:id]`
- Artifacts show up with expandable previews

## Example Prompts

```
"Create an artifact with a markdown guide on React hooks"

"Search for artifacts about Python"

"What workflows can you run?"

"Run the data processing workflow with 'The Quick Brown Fox' and reverse operation"

"Check the status of workflow run run-xxx"

"Generate a monthly report from the sales-api data source in markdown format"
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  http://localhost:3000                                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Port 3000)                   │
│  • Chat UI with AI streaming                                 │
│  • Artifacts CRUD interface                                  │
│  • Workflows management UI                                   │
└────┬────────────────────────────┬───────────────────────────┘
     │                            │
     │ AI Requests                │ Workflow Requests
     ▼                            ▼
┌─────────────────┐        ┌──────────────────────────────────┐
│  Anthropic API  │        │  Temporal Server (Port 7233)     │
│  Claude Opus 4  │        │  • Workflow orchestration         │
└─────────────────┘        │  • Status tracking                │
                           └────────┬─────────────────────────┘
                                    │
                                    │ Execute workflows
                                    ▼
                           ┌──────────────────────────────────┐
                           │  Temporal Worker                 │
                           │  • Runs workflow code            │
                           │  • Executes activities           │
                           └──────────────────────────────────┘
```

## Storage

All data is stored in the `data/` directory as JSON files:
- `data/chat-sessions.json` - Chat sessions
- `data/messages/[sessionId].json` - Messages per session
- `data/artifacts.json` - All artifacts
- `data/workflows.json` - Workflow definitions
- `data/workflow-runs.json` - Workflow run history

The `data/` directory is gitignored and created automatically.

## Stopping Services

In each terminal, press `Ctrl+C`:

```bash
# Terminal 1: Stop Temporal server
Ctrl+C

# Terminal 2: Stop Worker
Ctrl+C

# Terminal 3: Stop Next.js
Ctrl+C
```

## Troubleshooting

### "Node.js version >=20.9.0 is required"
```bash
nvm use
# or
nvm install 20
nvm use 20
```

### "Cannot connect to Temporal server"
```bash
# Ensure Temporal is running
temporal workflow list

# Restart if needed
temporal server start-dev
```

### Workflows stuck in "pending"
- Ensure the worker is running: `npm run worker`
- Check worker logs for errors

### Build errors
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### Port already in use
```bash
# Check what's using the port
lsof -ti:3000

# Kill the process if needed
lsof -ti:3000 | xargs kill
```

## Next Steps

- Read [TEMPORAL-SETUP.md](./TEMPORAL-SETUP.md) for detailed Temporal CLI setup
- Read [TEMPORAL.md](./TEMPORAL.md) for workflow development guide
- Read [PLAN.md](./PLAN.md) for architecture overview
- Explore the codebase:
  - `src/app/api/chat/stream/` - AI integration
  - `src/temporal/workflows/` - Workflow definitions
  - `src/components/` - UI components
  - `src/lib/storage/` - Data persistence

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Temporal Documentation](https://docs.temporal.io/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Ready to build?** Start customizing the workflows, add new AI tools, or swap storage backends!
