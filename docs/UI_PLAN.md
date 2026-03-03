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
12. Add new map types to `src/lib/types.ts` (`MapSource`, `MapLayerConfig`, `MapSection`, `MapBasemap`, `MapModifier`, `MapRegion`)
13. Create `src/lib/mapUtils.ts` — localStorage helpers + `getVisibleLayers` computation
14. Create `src/app/api/map/route.ts` — proxy GET to Aloft API (`/v1/airspace/maps?context=airaware`)
15. Create `src/app/api/map/geojson/[handle]/route.ts` — proxy GeoJSON source fetches (if needed for CORS)
16. Create `src/contexts/MapContext.tsx` — state, `fetchMapData`, `toggleLayer`, `toggleSection`, `setSelectedBasemap`, GeoJSON polling
17. Register `MapProvider` in `src/contexts/index.tsx` (wrap inside `WorkflowProvider`)
18. Install additional shadcn/ui deps if needed (`Accordion`, `RadioGroup`)
19. Build `src/components/main/MapLayerControls.tsx` — accordion UI replacing `LayerToggle`
20. Update `src/components/main/BasemapPicker.tsx` — use `mapContext.basemaps` + `mapContext.setSelectedBasemap`
21. Update `src/components/main/MapView.tsx` — render dynamic `<Source>` and `<Layer>` components from context
22. Update `src/components/main/Main.tsx` — remove local map state, use `MapContext`
23. Clean up: remove `src/app/api/layers/route.ts` stub and `src/components/main/LayerToggle.tsx`
24. Build `src/components/main/DashboardChat.tsx`
25. Build `src/components/main/DashboardArtifacts.tsx`
26. Build `src/components/main/GenerateReportButton.tsx`

---

## Verification

- ✅ `npm run build` — zero TypeScript errors
- `http://localhost:3000/` — full-screen map on left, right panel visible
- Map renders with valid `NEXT_PUBLIC_MAPBOX_TOKEN`
- BasemapPicker FAB switches map style
- LayerToggle FAB opens with empty list (stub)
- `GET /api/map` returns sources, layers, basemaps, sections, modifiers from Aloft
- Map renders all vector/raster sources as tile layers
- Map renders GeoJSON sources with polled data
- Switching basemap via controls changes the map style
- Toggling individual layers shows/hides them on the map
- Section master switch toggles all child layers
- Layer toggle state persists across page reloads (localStorage)
- Selected basemap persists across page reloads (localStorage)
- Non-toggleable layers (`allow_toggle: false`) have disabled switches
- Empty/loading states handled gracefully
- Chat panel accepts messages and streams AI responses
- Artifact list shows artifacts created by the AI during chat
- Generate Report button disabled when no artifacts present
- Generate Report button enabled once artifacts exist; modal opens with checkboxes
- Existing routes `/chat`, `/artifacts`, `/workflows` still render correctly with their container layouts

---

## API-Driven Map Layers, Sources & Controls

### Overview

Replace the current stub-based map layer system with a fully API-driven approach. The map configuration (sources, layers, basemaps, sections, modifiers) is fetched from the Aloft API at startup. A `MapContext` manages all map state (replacing the Redux pattern from the reference project). The `MapView` component renders Mapbox `<Source>` and `<Layer>` components dynamically, and `MapLayerControls` provides a section-based accordion UI for toggling layers, switching basemaps, and controlling modifiers.

### Reference Architecture

The reference project uses Redux. This project uses React Context. The mapping is:

| Reference (Redux)                     | This Project (Context)                    |
|---------------------------------------|-------------------------------------------|
| `mapSlice` reducer                    | `MapContext` + `useMapContext()`           |
| `dispatch(getMapData())`              | `mapContext.fetchMapData()`               |
| `useSelector(mapSourcesSelector)`     | `mapContext.sources`                      |
| `useSelector(mapLayersSelector)`      | `mapContext.layers`                       |
| `useSelector(visibleMapLayersSelector)`| `mapContext.visibleLayers`               |
| `useSelector(selectedBasemapSelector)`| `mapContext.selectedBasemap`              |
| `useSelector(mapBasemapsSelector)`    | `mapContext.basemaps`                     |
| `useSelector(mapSectionsSelector)`    | `mapContext.sections`                     |
| `useSelector(mapModifiersSelector)`   | `mapContext.modifiers`                    |
| `useSelector(geoJsonDataSelector)`    | `mapContext.geoJsonData`                  |
| `dispatch(startGeoJsonPolling(...))`  | Internal effect in `MapProvider`          |
| `localStorage` layer settings         | Same — `localStorage` helpers in utils    |

---

### Step 1: Types

**File:** `src/lib/types.ts` — Add/expand map types

```typescript
// ── Map API types (from Aloft /v1/airspace/maps response) ──

export interface MapSource {
  handle: string           // unique source ID, used as <Source id={...}>
  data_format: "geojson" | "vector" | "raster" | "raster-dem" | "raster-array"
  source_url?: string      // tile JSON URL (vector/raster sources)
}

export interface MapLayerStyle {
  type: string             // "fill", "line", "circle", "raster", etc.
  paint?: Record<string, unknown>
  layout?: Record<string, unknown>
  filter?: unknown[]
  minzoom?: number
  maxzoom?: number
  "source-layer"?: string  // for vector tile sources
  [key: string]: unknown   // pass-through for any Mapbox style props
}

export interface MapLayerConfig {
  id: string
  title: string
  description?: string
  source: string           // references a MapSource.handle
  thumbnail_url?: string
  allow_toggle: boolean
  styles: Record<string, MapLayerStyle[]>  // keyed by basemap ID
}

export interface MapSection {
  id: string
  title: string
  layers: string[]         // array of MapLayerConfig.id values
}

export interface MapBasemap {
  id: string
  name: string
  description?: string
  img_url?: string
  mapbox_path: string      // e.g. "mapbox://styles/mapbox/dark-v11"
  is_default?: boolean
}

export interface MapModifier {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  source?: string
  allow_toggle: boolean
  styles?: Record<string, MapLayerStyle[]>
}

export interface MapRegion {
  region: string
  bounding_box?: [[number, number], [number, number]]
}
```

> The existing `MapLayer` type (used by the stub system) should be kept for backward compatibility or removed once migration is complete.

---

### Step 2: API Route

**File:** `src/app/api/map/route.ts`

Proxies to the Aloft API to avoid CORS issues and keep the API base URL server-side.

```typescript
// GET /api/map
// Fetches map config from Aloft: sources, layers, sections, basemaps, modifiers, regions
// Returns the full response body as-is

// Env var: ALOFT_API_BASE_URL (default: https://api.aloft.rocks)
// Endpoint: GET ${ALOFT_API_BASE_URL}/v1/airspace/maps?context=airaware
```

**File:** `src/app/api/map/geojson/[handle]/route.ts`

Proxies individual GeoJSON source fetches for polling.

```typescript
// GET /api/map/geojson/:handle
// Fetches GeoJSON data for a specific source handle
// The source_url for geojson sources is determined by convention or stored in context
```

> **Note:** If GeoJSON source URLs are provided in the `sources` array from the API, we can fetch them directly client-side. If CORS is an issue, proxy through this route.

---

### Step 3: MapContext

**File:** `src/contexts/MapContext.tsx`

#### State Shape

```typescript
interface MapContextState {
  // Raw API data
  sources: MapSource[]
  layers: MapLayerConfig[]
  sections: MapSection[]
  basemaps: MapBasemap[]
  modifiers: MapModifier[]
  regions: MapRegion[]

  // Derived / user-controlled
  selectedBasemap: string          // MapBasemap.id
  visibleLayers: MapLayerConfig[]  // resolved from toggle settings
  geoJsonData: Record<string, GeoJSON.FeatureCollection>  // keyed by source handle

  // Loading
  loading: boolean
  error: string | null
}
```

#### Exposed API (via `useMapContext()`)

```typescript
interface MapContextType extends MapContextState {
  fetchMapData: () => Promise<void>
  toggleLayer: (layerId: string) => void
  toggleSection: (sectionId: string, value: boolean) => void
  setSelectedBasemap: (basemapId: string) => void
  getSelectedStyleUrl: () => string  // resolves basemap ID → mapbox_path
}
```

#### Key Behaviors

1. **`fetchMapData()`** — Called once on mount:
   - `GET /api/map` → destructure `{ sources, sections, layers, base_maps, modifiers, regions }`
   - Store all in context state
   - Restore `selectedBasemap` from `localStorage`, falling back to `base_maps.find(b => b.is_default)?.id`
   - Restore layer toggle settings from `localStorage`
   - Compute initial `visibleLayers` from settings + all layers + all modifiers

2. **`toggleLayer(layerId)`** — Toggles a single layer/modifier:
   - Update `localStorage` settings
   - Recompute `visibleLayers`

3. **`toggleSection(sectionId, value)`** — Toggles all layers in a section on/off:
   - Iterate `section.layers`, update each in `localStorage` settings (respecting `allow_toggle` and disabled toggles)
   - Recompute `visibleLayers`

4. **`setSelectedBasemap(basemapId)`** — Switches basemap:
   - Update `selectedBasemap` in state
   - Persist to `localStorage`

5. **GeoJSON polling** — Internal `useEffect`:
   - Filter `sources` for `data_format === "geojson"`
   - Set up an interval (e.g. 30s) to refetch each GeoJSON source URL
   - Store fetched data in `geoJsonData` map
   - Clean up intervals on unmount or source list change

#### LocalStorage Keys

| Key | Value |
|-----|-------|
| `airsenseai_selected_basemap` | basemap ID string |
| `airsenseai_layer_settings` | `Record<string, boolean>` — layerId → toggled on/off |

#### Utility Functions

**File:** `src/lib/mapUtils.ts`

```typescript
// Restore/save layer settings from localStorage
export const getLayerSettingsFromLS: () => Record<string, boolean>
export const saveLayerSettingsToLS: (settings: Record<string, boolean>) => void

// Restore/save selected basemap from localStorage
export const getSelectedBasemapFromLS: () => string | null
export const saveSelectedBasemapToLS: (basemapId: string) => void

// Given all layers, all modifiers, and current toggle settings,
// return the list of MapLayerConfig items that should be rendered
export const getVisibleLayers: (params: {
  allLayers: MapLayerConfig[]
  allModifiers: MapModifier[]
  settings: Record<string, boolean>
}) => MapLayerConfig[]

// Toggle a single layer in settings, return updated settings
export const toggleLayerSetting: (params: {
  settings: Record<string, boolean>
  layerId: string
}) => Record<string, boolean>

// Set all layers in a section to a specific value
export const setSectionLayerSettings: (params: {
  settings: Record<string, boolean>
  section: MapSection
  allLayers: MapLayerConfig[]
  value: boolean
  disabledToggles?: string[]
}) => Record<string, boolean>

// Initialize settings for newly-discovered layers (merge with existing)
export const initializeLayerSettings: (params: {
  allLayers: MapLayerConfig[]
  allModifiers: MapModifier[]
  existingSettings: Record<string, boolean>
}) => Record<string, boolean>
```

---

### Step 4: Register MapContext in AppProviders

**File:** `src/contexts/index.tsx`

```typescript
import { MapProvider } from './MapContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <ArtifactProvider>
        <WorkflowProvider>
          <MapProvider>
            {children}
          </MapProvider>
        </WorkflowProvider>
      </ArtifactProvider>
    </ChatProvider>
  );
}

export { MapProvider, useMapContext } from './MapContext';
```

---

### Step 5: Update MapView to Render Sources & Layers

**File:** `src/components/main/MapView.tsx`

Replace the current static `<Map>` with dynamic source and layer rendering.

#### Source Rendering

Inside `<Map>`, iterate `sources` from context:

```tsx
{sources.map(s => {
  if (s.data_format === "geojson") {
    return (
      <Source
        key={s.handle}
        id={s.handle}
        type="geojson"
        data={geoJsonData[s.handle] || { type: "FeatureCollection", features: [] }}
      />
    );
  }
  if (["vector", "raster", "raster-dem", "raster-array"].includes(s.data_format)) {
    return (
      <Source
        key={s.handle}
        id={s.handle}
        type={s.data_format as "vector" | "raster" | "raster-dem"}
        url={s.source_url}
      />
    );
  }
  return null;
})}
```

#### Layer Rendering

After sources, iterate `visibleLayers` from context:

```tsx
{visibleLayers.map(layer => {
  const stylesForBasemap = layer.styles?.[selectedBasemap];
  if (!stylesForBasemap) return null;

  return stylesForBasemap.map((style, idx) => {
    if (!style || !style.type) return null;
    const layerId = `${layer.id}-style-${idx}`;
    return (
      <Layer
        key={layerId}
        id={layerId}
        source={layer.source}
        source-layer={style["source-layer"]}
        type={style.type}
        paint={style.paint}
        layout={style.layout}
        filter={style.filter}
        minzoom={style.minzoom}
        maxzoom={style.maxzoom}
      />
    );
  });
})}
```

#### Props Change

MapView will pull most data from `useMapContext()` instead of props. The props interface simplifies to just accepting `children` (for overlays like markers) and optional map event callbacks.

---

### Step 6: Update BasemapPicker

**File:** `src/components/main/BasemapPicker.tsx`

Change from hardcoded `BASEMAPS` array to using `mapContext.basemaps` from the API.

- Each option shows `basemap.name`, `basemap.description`, and optionally `basemap.img_url` as a thumbnail
- Active basemap determined by `mapContext.selectedBasemap === basemap.id`
- On select: `mapContext.setSelectedBasemap(basemap.id)`
- If the API returns no basemaps, fall back to the current hardcoded list

---

### Step 7: Replace LayerToggle with MapLayerControls

**File:** `src/components/main/MapLayerControls.tsx` (new, replaces `LayerToggle.tsx`)

Replicates the reference project's accordion-based layer control panel.

#### UI Structure

```
┌─────────────────────────────────────┐
│ [Layers FAB] → opens Popover/Sheet  │
├─────────────────────────────────────┤
│ ▼ Base Map (Accordion, default open)│
│   ○ Streets         [radio]         │
│   ● Dark            [radio]         │
│   ○ Satellite       [radio]         │
│   ─────────────────                 │
│   ☐ Modifier 1      [switch]        │
│   ☑ Modifier 2      [switch]        │
├─────────────────────────────────────┤
│ ▶ Section: Airspace  [section switch]│
│   ☑ Layer A          [switch]       │
│   ☐ Layer B          [switch]       │
│   ☑ Layer C          [switch]       │
├─────────────────────────────────────┤
│ ▶ Section: Weather   [section switch]│
│   ☑ Layer D          [switch]       │
│   ☐ Layer E          [switch]       │
└─────────────────────────────────────┘
```

#### Behavior

- Each **section** has a master switch that toggles all its child layers on/off
- Section master switch is checked when **all** child layers are on
- Individual layer switches respect `allow_toggle` — non-toggleable layers are disabled
- **Basemap** selection uses radio buttons, one per basemap from API
- **Modifiers** are rendered below basemaps with toggle switches
- Layer/modifier thumbnails (`thumbnail_url`) shown as small avatars when available
- Layer descriptions shown as muted subtitle text
- Disabled state: when `loading` is true, all controls are disabled

#### Dependencies

- shadcn/ui: `Popover`, `Switch`, `ScrollArea`
- May need to add a shadcn `Accordion` component, or use `@radix-ui/react-accordion` + `@radix-ui/react-radio-group`
- lucide-react: `Layers` icon

---

### Step 8: Update Main Component

**File:** `src/components/main/Main.tsx`

- Remove local `basemap`, `layers`, `visibleLayers` state — all moved to `MapContext`
- Remove the `GET /api/layers` fetch — replaced by `MapContext.fetchMapData()`
- Remove `handleLayerToggle` — replaced by `MapContext.toggleLayer()`
- `<MapView>` no longer receives layer/basemap props (reads from context)
- Keep layout structure intact

---

### Step 9: Clean Up

- Remove or deprecate `src/app/api/layers/route.ts` (stub endpoint)
- Remove `LayerToggle.tsx` (replaced by `MapLayerControls.tsx`)
- Optionally remove old `MapLayer` type from `types.ts` if no longer used
- Update the `BasemapPicker` to be context-aware (may merge into `MapLayerControls` or keep as separate FAB)

---

### Implementation Order

12. Add new map types to `src/lib/types.ts` (`MapSource`, `MapLayerConfig`, `MapSection`, `MapBasemap`, `MapModifier`, `MapRegion`)
13. Create `src/lib/mapUtils.ts` — localStorage helpers + `getVisibleLayers` computation
14. Create `src/app/api/map/route.ts` — proxy GET to Aloft API (`/v1/airspace/maps?context=airaware`)
15. Create `src/app/api/map/geojson/[handle]/route.ts` — proxy GeoJSON source fetches (if needed for CORS)
16. Create `src/contexts/MapContext.tsx` — state, `fetchMapData`, `toggleLayer`, `toggleSection`, `setSelectedBasemap`, GeoJSON polling
17. Register `MapProvider` in `src/contexts/index.tsx` (wrap inside `WorkflowProvider`)
18. Install additional shadcn/ui deps if needed (`Accordion`, `RadioGroup`)
19. Build `src/components/main/MapLayerControls.tsx` — accordion UI replacing `LayerToggle`
20. Update `src/components/main/BasemapPicker.tsx` — use `mapContext.basemaps` + `mapContext.setSelectedBasemap`
21. Update `src/components/main/MapView.tsx` — render dynamic `<Source>` and `<Layer>` components from context
22. Update `src/components/main/Main.tsx` — remove local map state, use `MapContext`
23. Clean up: remove `src/app/api/layers/route.ts` stub and `src/components/main/LayerToggle.tsx`

---

### Environment Variables

Add to `.env.local`:
```
ALOFT_API_BASE_URL=https://api.aloft.rocks
```

> `NEXT_PUBLIC_MAPBOX_TOKEN` is already required.
