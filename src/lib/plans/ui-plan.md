# AirSenseAI — UI Redesign Plan

## Overview

Replace the current multi-page landing page with a unified full-screen dashboard at `/`. The dashboard combines a Mapbox map, a chat panel, an artifact list, and a report generation button in a single view. Existing routes (`/chat`, `/artifacts`, `/workflows`) remain functional but are no longer linked from the nav.

**Change log:**
- Left nav removed entirely (user request) — `Navigation` component and `ml-16` offset both deleted
- `src/components/dashboard/` renamed to `src/components/main/`; `Main` component renamed from `Main` (user request)
- Right column widened to 30% / map narrowed to 70% (user request)
- Panel proportions changed: Chat flex:2, Artifacts flex:1 of remaining height; Generate Report fixed height (user request)
- Generate Report container uses `py-[30px]` fixed padding, full-width button (user request)
- Chat and Artifacts sections made internally scrollable (user request)

---

## Prerequisites

### New Dependencies ✅
```bash
npm install react-map-gl mapbox-gl
npm install -D @types/mapbox-gl
```
> Also added `src/types/mapbox__point-geometry/index.d.ts` stub + `typeRoots` in `tsconfig.json` to silence broken `@types/mapbox__point-geometry` transitive dep.

### Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>
```

---

## Layout / Route Changes ✅

| File | Change | Status |
|------|--------|--------|
| `src/app/layout.tsx` | Remove container wrapper; remove `<Navigation />`; remove `ml-16` offset | ✅ |
| `src/app/chat/page.tsx` | Add `<div className="container mx-auto px-8 py-8">` wrapper | ✅ |
| `src/app/artifacts/page.tsx` | Add `<div className="container mx-auto px-8 py-8">` wrapper | ✅ |
| `src/app/workflows/page.tsx` | Add `<div className="container mx-auto px-8 py-8">` wrapper | ✅ |
| `src/app/page.tsx` | Replace landing page content with `<Main />` | ✅ |
| `src/components/layout/Navigation.tsx` | ~~Remove nav items~~ → **Entire nav removed** (user request) | ✅ |
| `src/app/api/layers/route.ts` | Create stub GET route returning `[]` | ✅ |

---

## Component 1: Main ✅


**File:** `src/components/main/Main.tsx`

### Responsibility
- Full-screen two-column layout (no nav offset — nav removed)
- Left column (75% width): `<MapView />` (placeholder until Component 2 built)
- Right column (25% width): stacked `<DashboardChat />`, `<DashboardArtifacts />`, `<GenerateReportButton />`
- Owns top-level state: `basemap`, `visibleLayers`, `layers` (fetched from `/api/layers`)

### Visual Layout
```
┌──────────────────────────────────────────────────────────┐
│           MapView (70%)           │ Panel (30%)           │
│                                   │ Chat (flex:2, scroll) │
│   [Mapbox Map fills full height]  │                       │
│                                   ├───────────────────────┤
│   [BasemapPicker FAB][Layer FAB]  │ Artifacts (flex:1, scroll)│
│   top-left of map                 ├───────────────────────┤
│                                   │ Report (fixed: py-30px)│
└──────────────────────────────────────────────────────────┘
```

### Key Styles
- Outer div: `h-screen overflow-hidden flex flex-row`
- Left: `flex-none w-[70%] relative h-full`
- Right: `flex-none w-[30%] flex flex-col h-full border-l border-border`
- Chat wrapper: `flex flex-col overflow-hidden border-b border-border` `flex: 2` — inner div `flex-1 overflow-y-auto`
- Artifacts wrapper: `flex flex-col overflow-hidden border-b border-border` `flex: 1` — inner div `flex-1 overflow-y-auto`
- Report wrapper: `flex-none px-4 py-[30px] border-t border-border` — button `w-full`

### Data Fetching
- `useEffect` on mount: `GET /api/layers` → set `layers` state
- `layers`, `visibleLayers`, `basemap` passed down to `<MapView />`

---

## Component 2: MapView ✅

**File:** `src/components/main/MapView.tsx`

### Responsibility
- Renders a Mapbox GL map via `react-map-gl`
- Hosts `<BasemapPicker />` and `<LayerToggle />` as absolutely-positioned FABs in the top-left corner
- Switches map style when basemap changes
- Toggles layer visibility when `visibleLayers` changes

### Props
```typescript
interface MapViewProps {
  layers: MapLayer[]
  visibleLayers: string[]
  onLayerToggle: (layerId: string) => void
  basemap: string
  onBasemapChange: (styleUrl: string) => void
}
```

### Key Implementation Notes
- `"use client"` directive required
- `<Map>` from `react-map-gl` needs explicit width/height parent — use `className="w-full h-full"`
- `mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
- Default center: `[-98.5795, 39.8283]` (continental US), zoom: `4`
- FABs wrapped in `<div className="absolute top-4 left-4 flex flex-col gap-2 z-10">`

---

## Component 3: BasemapPicker ✅

**File:** `src/components/main/BasemapPicker.tsx`

### Responsibility
- Floating action button (top-left of map) that opens a popover for picking a Mapbox basemap style

### Props
```typescript
interface BasemapPickerProps {
  basemap: string
  onChange: (styleUrl: string) => void
}
```

### Basemap Options
| Label | Style URL |
|-------|-----------|
| Streets | `mapbox://styles/mapbox/streets-v12` |
| Satellite | `mapbox://styles/mapbox/satellite-streets-v12` |
| Outdoors | `mapbox://styles/mapbox/outdoors-v12` |
| Dark | `mapbox://styles/mapbox/dark-v11` |
| Light | `mapbox://styles/mapbox/light-v11` |

### UI
- Round button with `Map` icon from `lucide-react`
- shadcn/ui `Popover` listing the basemap options as buttons
- Active basemap highlighted

---

## Component 4: LayerToggle ✅

**File:** `src/components/main/LayerToggle.tsx`

### Responsibility
- Floating action button (below BasemapPicker) that opens a popover listing available map layers with on/off switches

### Types
```typescript
// Add to src/lib/types.ts — ✅ Done
interface MapLayer {
  id: string
  name: string
  description?: string
}
```

### Props
```typescript
interface LayerToggleProps {
  layers: MapLayer[]
  visibleLayers: string[]
  onToggle: (layerId: string) => void
}
```

### UI
- Round button with `Layers` icon from `lucide-react`
- shadcn/ui `Popover` with scrollable list
- Each layer row: name + shadcn/ui `Switch`
- Shows "No layers available" when `layers` is empty

### Layer API Stub ✅
`src/app/api/layers/route.ts` — returns `[]`. Replace with real implementation when endpoint is ready.

> Also installed `@radix-ui/react-popover` and `@radix-ui/react-switch`; created `src/components/ui/popover.tsx` and `src/components/ui/switch.tsx`.

---

## Component 5: DashboardChat

**File:** `src/components/main/DashboardChat.tsx`

### Responsibility
- Simplified chat panel occupying the **top 40%** of the right column
- Message history scrolling area at top, input pinned to bottom
- No session sidebar, no "New Chat" button, no session list — single auto-created session

### Reuses (unchanged)
- `MessageList` — `src/components/chat/MessageList.tsx`
- `MessageInput` — `src/components/chat/MessageInput.tsx`
- `ThinkingIndicator` — `src/components/chat/ThinkingIndicator.tsx`
- `useChatContext()` — `src/contexts/ChatContext.tsx`

### Behavior
- On mount: call `loadSessions()`. If no sessions exist, call `createSession('Dashboard')`.
- Always use `sessions[0]` (or the auto-created session).
- `sendMessage(content)` via `ChatContext.sendMessage`.

### Layout
```
┌─────────────────────┐  ← 40% of right column height
│  MessageList        │  (flex-1, overflow-y-auto)
│  (scrollable)       │
│                     │
├─────────────────────┤
│  ThinkingIndicator  │  (conditional)
├─────────────────────┤
│  MessageInput       │  (flex-none, border-top)
└─────────────────────┘
```

### Key Styles on Wrapper
```
className="flex flex-col overflow-hidden border-b border-border" style={{ flex: 2 }}
// inner scroll container: className="flex-1 overflow-y-auto"
```

---

## Component 6: DashboardArtifacts

**File:** `src/components/main/DashboardArtifacts.tsx`

### Responsibility
- Simplified artifact list occupying the **middle 40%** of the right column
- Scrollable list of artifact cards
- No search input, no "New Artifact" button
- Shows an empty state message when no artifacts exist

### Reuses (unchanged)
- `ArtifactCard` — `src/components/artifacts/ArtifactCard.tsx` (pass no-op handlers for edit/delete)
- `useArtifactContext()` — `src/contexts/ArtifactContext.tsx`

### Behavior
- On mount: call `loadArtifacts()` from ArtifactContext.
- Render `ArtifactCard` for each artifact in a single-column `ScrollArea`.
- Empty state: small centered text "No artifacts yet — start chatting to create them."

### Key Styles on Wrapper
```
className="flex flex-col overflow-hidden border-b border-border" style={{ flex: 1 }}
// inner scroll container: className="flex-1 overflow-y-auto"
```

---

## Component 7: GenerateReportButton

**File:** `src/components/main/GenerateReportButton.tsx`

### Responsibility
- "Generate Report" button occupying the **bottom 20%** of the right column, centered
- Disabled when `artifacts.length === 0`
- Opens a full-width dialog modal on click

### Reuses
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` — shadcn/ui
- `Checkbox` — shadcn/ui
- `Input` — shadcn/ui
- `useArtifactContext()` — `src/contexts/ArtifactContext.tsx`

### Modal Contents
1. **Text input**: Report title / description
2. **Artifact checklist**: Each artifact shown with `Checkbox` + name label; all pre-checked on open
3. **Footer**: "Cancel" button (secondary) left-aligned, "Generate" button (primary) right-aligned

### State
```typescript
const [open, setOpen] = useState(false)
const [reportTitle, setReportTitle] = useState('')
const [selectedIds, setSelectedIds] = useState<string[]>([])
```

### Behavior
- On open: initialize `selectedIds` with all `artifacts.map(a => a.id)`
- Generate button: disabled if `reportTitle` is empty or no artifacts selected
- Generate action: placeholder (`console.log`) for now — to be wired up later
- Cancel: close modal, reset state

### Key Styles on Wrapper
```
className="flex-none p-[30px] border-t border-border"
// button: className="w-full ..."
```

---

## Implementation Order

1. ✅ Install `react-map-gl`, `mapbox-gl`, `@types/mapbox-gl`
2. ✅ Add `MapLayer` type to `src/lib/types.ts`
3. ✅ Modify `src/app/layout.tsx` — remove container wrapper, remove nav, remove `ml-16`
4. ✅ Add container wrappers back to `/chat`, `/artifacts`, `/workflows` pages
5. ✅ ~~Remove nav items from `Navigation.tsx`~~ → Removed entire nav (user request)
6. ✅ Create `src/app/api/layers/route.ts` stub
7. ✅ Build **Main** — scaffold with placeholder sections
8. ✅ Replace `src/app/page.tsx` with `<Main />`
9. ✅ Build **MapView** — render map with token
10. ✅ Build **BasemapPicker** — FAB + popover
11. ✅ Build **LayerToggle** — FAB + popover + stub layers
12. Build **DashboardChat** — wire up existing chat components
13. Build **DashboardArtifacts** — wire up existing artifact components
14. Build **GenerateReportButton** — button + modal

---

## Verification

- ✅ `npm run build` — zero TypeScript errors
- `http://localhost:3000/` — full-screen map on left, right panel visible
- Map renders with valid `NEXT_PUBLIC_MAPBOX_TOKEN`
- BasemapPicker FAB switches map style
- LayerToggle FAB opens with empty list (stub)
- Chat panel accepts messages and streams AI responses
- Artifact list shows artifacts created by the AI during chat
- Generate Report button disabled when no artifacts present
- Generate Report button enabled once artifacts exist; modal opens with checkboxes
- Existing routes `/chat`, `/artifacts`, `/workflows` still render correctly with their container layouts
