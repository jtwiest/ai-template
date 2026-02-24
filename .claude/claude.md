# Claude Instructions for AI MVP Template

## Project Context

This is an AI MVP template project for building AI-powered applications with three core features:
- **Chat**: Conversational interface with AI agents
- **Artifacts**: CRUD system for markdown documents
- **Workflows**: Temporal workflow integration

## Working Preferences

### Documentation Updates
**CRITICAL**: After completing any implementation phase or significant feature:
1. ALWAYS update `docs/PLAN.md` with status changes
2. Mark completed tasks with ✅ checkboxes
3. Update the "Current Status" section
4. Add completion summaries with what was built
5. Move phase markers (⬅️ NEXT PHASE) to the upcoming phase

### Development Workflow
1. Read `docs/PLAN.md` at the start of each session to understand current status
2. Follow the phase-by-phase implementation plan
3. Use TodoWrite tool to track progress during implementation
4. Update plan document when phase is complete
5. Commit changes with descriptive messages

### Code Organization
- Follow the component architecture defined in `docs/PLAN.md`
- Keep TypeScript types in `src/lib/types.ts`
- Place shared utilities in `src/lib/utils.ts`
- Organize components by feature: `src/components/{chat,artifacts,workflows}/`
- Use shadcn/ui components from `src/components/ui/`

### Technology Stack Conventions
- **Next.js 16**: Use App Router, Server Components where possible
- **TypeScript**: Strict typing, no `any` types
- **Tailwind CSS**: Use utility classes, follow shadcn/ui patterns
- **React 19**: Use modern hooks, avoid class components
- **Node 20+**: Required for Next.js 16

### Code Style
- Use "use client" directive for client components
- Prefer named exports over default exports for components (except pages)
- Use arrow functions for components
- Include proper TypeScript types for all props
- Add descriptive comments for complex logic

### File Naming
- Components: PascalCase (e.g., `ChatContainer.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Types: camelCase files, PascalCase types (e.g., `types.ts` exports `Message`)
- Pages: lowercase (e.g., `page.tsx`)

### Git Practices
- Only commit when explicitly requested by user
- Use descriptive commit messages following conventional commits format
- Include co-authorship footer for Claude contributions
- Stage relevant files only

### Development Server
**IMPORTANT**: Do NOT automatically start the dev server unless explicitly requested.
- Assume the user is managing the dev server themselves
- If testing is needed, first check if a server is already running:
  ```bash
  lsof -ti:3000  # Check if port 3000 is in use
  ```
- If the user reports issues and a server is running, suggest they restart it
- Only start the dev server if the user specifically asks you to run it

### Testing & Validation
- Test UI components with mock data before backend integration
- Verify responsive design works on mobile
- Check TypeScript compilation with `npm run build`
- User will handle dev server restarts for testing changes

### AI SDK Integration (Phase 3+)
- Use Vercel AI SDK for streaming responses
- Support multiple AI providers (OpenAI, Anthropic)
- Implement proper error handling for API calls
- Store API keys in environment variables

### Storage Strategy
- Start with filesystem-based storage (JSON files)
- Design with abstraction layer for easy database migration
- Keep storage interface separate from business logic
- Plan for future Postgres/SQLite integration

### Workflow Integration (Phase 5+)
- Use Temporal SDK for workflow orchestration
- Store workflow results as artifacts
- Provide agent tools to trigger workflows
- Handle long-running workflows gracefully

## Common Commands

```bash
# Development (User-Managed)
npm run dev              # Start dev server (requires Node 20+)
nvm use                  # Switch to Node 20 (if using nvm)
lsof -ti:3000            # Check if dev server is running

# Building
npm run build            # Production build and type checking
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint

# Troubleshooting
# If dev server won't start, check for existing process:
lsof -ti:3000 | xargs kill  # Kill process on port 3000
```

## Quick Reference

- **Plan Document**: `docs/PLAN.md` - Always check this first
- **Types**: `src/lib/types.ts` - All TypeScript interfaces
- **Current Phase**: Phase 2 Complete ✅ - Moving to Phase 3
- **Dev Server**: http://localhost:3000 (user-managed)
- **Node Version**: 20.20.0
- **Data Storage**: `data/` directory (JSON files, gitignored)

## Phase Checklist

When completing a phase:
- [ ] Mark all tasks as complete in plan
- [ ] Add completion summary with components built
- [ ] Update "Current Status" section
- [ ] Move "NEXT PHASE" marker
- [ ] Test all features work as expected
- [ ] Commit changes if requested

## Notes for Future Sessions

- Always read `docs/PLAN.md` before starting work
- Check git status to understand what's changed
- Verify dev server requirements (Node 20+)
- Reference this file for project conventions
