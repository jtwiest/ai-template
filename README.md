# AI MVP Template

A production-ready Next.js template for building AI-powered applications with chat, artifacts, and workflow orchestration.

## Features

- **Chat Interface**: Conversational AI with streaming responses powered by Claude
- **Artifacts System**: CRUD operations for markdown documents with AI integration
- **Workflow Orchestration**: Temporal-based workflow management with automatic result storage
- **Modern Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS

## Quick Start

### Prerequisites

- **macOS** (this guide is Mac-specific)
- **Node.js 20+** ([Install via nvm](https://github.com/nvm-sh/nvm))
- **Temporal CLI** (`brew install temporal`)
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-template

# Switch to Node 20 (if using nvm)
nvm use

# Install dependencies
npm install

# Install Temporal CLI
brew install temporal
```

### Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your API key
# ANTHROPIC_API_KEY=sk-ant-...
```

### Running the Application

You'll need **3 terminal windows**:

**Terminal 1 - Temporal Server:**
```bash
temporal server start-dev
# Web UI available at http://localhost:8233
```

**Terminal 2 - Temporal Worker:**
```bash
npm run worker
# Wait for "Temporal worker starting..." message
```

**Terminal 3 - Next.js App:**
```bash
npm run dev
# Open http://localhost:3000
```

That's it! See the [Quick Start Guide](docs/QUICKSTART.md) for detailed usage examples.

## Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Temporal Setup](docs/TEMPORAL-SETUP.md)** - Detailed Temporal CLI installation and configuration
- **[Temporal Workflows](docs/TEMPORAL.md)** - Workflow development and usage guide
- **[Architecture Plan](docs/PLAN.md)** - Project architecture and implementation roadmap

## Project Structure

```
ai-template/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── chat/              # Chat interface
│   │   ├── artifacts/         # Artifacts management
│   │   └── workflows/         # Workflows UI
│   ├── components/            # React components
│   │   ├── chat/             # Chat-specific components
│   │   ├── artifacts/        # Artifact components
│   │   ├── workflows/        # Workflow components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Shared utilities
│   │   ├── storage/          # Data persistence layer
│   │   └── types.ts          # TypeScript types
│   └── temporal/              # Temporal workflows
│       ├── workflows/        # Workflow definitions
│       ├── activities/       # Activity implementations
│       ├── worker.ts         # Worker process
│       └── client.ts         # Temporal client
├── data/                      # Local JSON storage (gitignored)
└── docs/                      # Documentation
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **AI SDK**: [Anthropic Claude](https://docs.anthropic.com/)
- **Workflows**: [Temporal](https://temporal.io/)

## Development

### Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run worker           # Start Temporal worker

# Building
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
```

### Storage

Data is stored in the `data/` directory as JSON files:
- `chat-sessions.json` - Chat sessions
- `messages/[sessionId].json` - Messages per session
- `artifacts.json` - All artifacts
- `workflows.json` - Workflow definitions
- `workflow-runs.json` - Workflow run history

### Adding Features

See [docs/PLAN.md](docs/PLAN.md) for the architecture overview and implementation phases.

## Troubleshooting

### Node.js Version Issues
```bash
nvm use
# or install Node 20
nvm install 20
nvm use 20
```

### Temporal Connection Errors
```bash
# Verify Temporal is running
temporal workflow list

# Restart if needed
temporal server start-dev
```

### Port Conflicts
```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill process if needed
lsof -ti:3000 | xargs kill
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Temporal Documentation](https://docs.temporal.io/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## License

MIT
