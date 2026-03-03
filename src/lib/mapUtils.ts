import { MapLayerConfig, MapModifier, MapSection } from "./types"

const LS_BASEMAP_KEY = "airsenseai_selected_basemap"
const LS_LAYER_SETTINGS_KEY = "airsenseai_layer_settings"

export const getSelectedBasemapFromLS = (): string | null => {
  try {
    return localStorage.getItem(LS_BASEMAP_KEY)
  } catch {
    return null
  }
}

export const saveSelectedBasemapToLS = (basemapId: string): void => {
  try {
    localStorage.setItem(LS_BASEMAP_KEY, basemapId)
  } catch {
    // ignore
  }
}

export const getLayerSettingsFromLS = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(LS_LAYER_SETTINGS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

export const saveLayerSettingsToLS = (settings: Record<string, boolean>): void => {
  try {
    localStorage.setItem(LS_LAYER_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

// Merge newly-discovered layers into existing settings (default to true/on)
export const initializeLayerSettings = ({
  allLayers,
  allModifiers,
  existingSettings,
}: {
  allLayers: MapLayerConfig[]
  allModifiers: MapModifier[]
  existingSettings: Record<string, boolean>
}): Record<string, boolean> => {
  const merged = { ...existingSettings }
  for (const layer of allLayers) {
    if (!(layer.id in merged)) {
      merged[layer.id] = true
    }
  }
  for (const mod of allModifiers) {
    if (!(mod.id in merged)) {
      merged[mod.id] = true
    }
  }
  return merged
}

// Return layers + modifiers that should currently be visible
export const getVisibleLayers = ({
  allLayers,
  allModifiers,
  settings,
}: {
  allLayers: MapLayerConfig[]
  allModifiers: MapModifier[]
  settings: Record<string, boolean>
}): MapLayerConfig[] => {
  const visibleLayers = allLayers.filter(l => settings[l.id] !== false)

  // Treat modifiers as layers for rendering purposes
  const visibleModifiers: MapLayerConfig[] = allModifiers
    .filter(m => settings[m.id] !== false && m.styles)
    .map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      source: m.source ?? "",
      thumbnail_url: m.thumbnail_url,
      allow_toggle: m.allow_toggle,
      styles: m.styles!,
    }))

  return [...visibleLayers, ...visibleModifiers]
}

// Toggle a single layer in settings
export const toggleLayerSetting = ({
  settings,
  layerId,
}: {
  settings: Record<string, boolean>
  layerId: string
}): Record<string, boolean> => ({
  ...settings,
  [layerId]: !settings[layerId],
})

// Set all layers in a section to a specific value (respecting disabled toggles)
export const setSectionLayerSettings = ({
  settings,
  section,
  allLayers,
  value,
  disabledToggles = [],
}: {
  settings: Record<string, boolean>
  section: MapSection
  allLayers: MapLayerConfig[]
  value: boolean
  disabledToggles?: string[]
}): Record<string, boolean> => {
  const updated = { ...settings }
  for (const layerId of section.layers) {
    if (disabledToggles.includes(layerId)) continue
    const layer = allLayers.find(l => l.id === layerId)
    if (layer && !layer.allow_toggle) continue
    updated[layerId] = value
  }
  return updated
}
