# Temporal CLI Setup Guide (macOS)

This guide shows you how to install and run Temporal locally on macOS using the Temporal CLI.

## Prerequisites

- **macOS** (this guide is Mac-specific)
- **Node.js 20+** (use `nvm use` to switch)
- **Homebrew** ([Install here](https://brew.sh/))

## Step 1: Install Temporal CLI

Install the Temporal CLI which includes a built-in development server:

```bash
brew install temporal
```

Verify installation:
```bash
temporal --version
```

You should see output like:
```
temporal version 1.x.x (server 1.x.x)
```

## Step 2: Running the Stack (3 Terminal Sessions)

You'll need **3 separate terminal windows/tabs**:

### Terminal 1: Temporal Server

Start the Temporal development server with embedded SQLite:

```bash
temporal server start-dev
```

**What you'll see:**
```
Temporal server started, available at localhost:7233
Web UI: http://localhost:8233
```

**Features:**
- ✅ gRPC endpoint at `localhost:7233`
- ✅ Web UI at `http://localhost:8233`
- ✅ SQLite database in `~/.temporal/`
- ✅ Auto-creates default namespace

**Leave this running** - Ctrl+C to stop when done.

---

### Terminal 2: Temporal Worker

The worker executes your workflow and activity code:

```bash
# Make sure you're in the project directory
cd /path/to/ai-template

# Use Node 20
nvm use

# Start the worker
npm run worker
```

**What you'll see:**
```
Temporal worker starting...
Task Queue: ai-template-workflows
Temporal Address: localhost:7233
```

**Leave this running** - the worker will process workflow tasks.

---

### Terminal 3: Next.js Application

Start your Next.js development server:

```bash
# Make sure you're in the project directory
cd /path/to/ai-template

# Use Node 20
nvm use

# Start Next.js
npm run dev
```

**Access the app:**
- Application: http://localhost:3000
- Temporal Web UI: http://localhost:8233

---

## Quick Test

Once all 3 terminals are running:

1. **Open the app**: http://localhost:3000/chat
2. **Try these prompts:**
   ```
   What workflows are available?

   Run the data processing workflow to convert "hello world" to uppercase

   Check the status of that workflow run
   ```
3. **Monitor in Temporal UI**: http://localhost:8233
   - You'll see workflows appear in real-time
   - Click on any workflow to see execution details

---

## Environment Configuration

Make sure your `.env.local` has:

```bash
# Anthropic API Key (required for chat)
ANTHROPIC_API_KEY=sk-ant-...

# Temporal Server Address (default works for local dev)
TEMPORAL_ADDRESS=localhost:7233
```

---

## Troubleshooting

### Worker won't start - "Cannot find module"
```bash
# Install dependencies
npm install

# Check Node version
node --version  # Should be 20+
nvm use
```

### "Cannot connect to Temporal server"
```bash
# Check if Temporal is running
temporal workflow list

# If not, start the server in Terminal 1
temporal server start-dev
```

### Worker not picking up workflows
- Make sure worker is running (`npm run worker`)
- Check worker logs for errors
- Verify task queue name matches: `ai-template-workflows`

### Port already in use
```bash
# Check what's using port 7233
lsof -ti:7233

# Kill the process if needed
lsof -ti:7233 | xargs kill
```

### Temporal CLI not found
```bash
# Reinstall via Homebrew
brew install temporal

# Or update Homebrew first
brew update
brew install temporal
```

---

## Stopping Services

**In each terminal, press `Ctrl+C`:**

1. Terminal 1: Stop Temporal server
2. Terminal 2: Stop worker
3. Terminal 3: Stop Next.js

**Clean up Temporal data** (optional):
```bash
rm -rf ~/.temporal/
```

---

## Development Workflow

### Making Changes to Workflows

1. Edit workflow/activity files in `src/temporal/`
2. **Stop the worker** (Ctrl+C in Terminal 2)
3. **Restart the worker**: `npm run worker`
4. Trigger new workflow runs to test changes

**Note:** You don't need to restart the Temporal server when changing workflow code.

### Viewing Workflow Execution

Open Temporal Web UI at http://localhost:8233:

- **Workflows** tab: See all workflow executions
- Click a workflow to see:
  - Execution history
  - Activity results
  - Timeline visualization
  - Stack traces (if failed)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Terminal 1: Temporal Server (localhost:7233)                │
│ • Manages workflow state                                     │
│ • Stores history in SQLite                                   │
│ • Serves Web UI on port 8233                                 │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┐
             │              │
             ▼              ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│ Terminal 2: Worker  │  │ Terminal 3: Next.js (port 3000)  │
│ • Executes workflows│  │ • Handles HTTP requests           │
│ • Runs activities   │  │ • Triggers workflows via client   │
│ • Task queue: ...   │  │ • Updates storage with results    │
└─────────────────────┘  └──────────────────────────────────┘
```

---

## Advanced Configuration

### Custom Temporal Server Ports

If you need to use different ports, you can configure the Temporal CLI:

```bash
# Start with custom ports
temporal server start-dev \
  --port 7234 \
  --ui-port 8234
```

Then update your `.env.local`:
```bash
TEMPORAL_ADDRESS=localhost:7234
```

### Using Multiple Namespaces

```bash
# List namespaces
temporal operator namespace list

# Create a new namespace
temporal operator namespace create my-namespace

# Use namespace in client
# Update src/temporal/client.ts with namespace: 'my-namespace'
```

---

## Production Considerations

For production, you would:

1. **Use managed Temporal** (Temporal Cloud) or self-hosted cluster
2. **Run worker as a service** (e.g., systemd, Docker, K8s)
3. **Use PostgreSQL** instead of SQLite
4. **Scale workers** horizontally for high throughput
5. **Add monitoring** (Prometheus, Grafana)
6. **Configure retry policies** and timeouts appropriately

---

## Next Steps

- Read [TEMPORAL.md](./TEMPORAL.md) for workflow development guide
- Read [QUICKSTART.md](./QUICKSTART.md) for the full app setup
- Explore `src/temporal/workflows/` and `src/temporal/activities/`
- Try creating your own custom workflow

---

## Resources

- [Temporal CLI Docs](https://docs.temporal.io/cli)
- [Temporal TypeScript SDK](https://typescript.temporal.io/)
- [Workflow Development Guide](https://docs.temporal.io/develop/typescript)
- [Temporal Cloud](https://temporal.io/cloud)
