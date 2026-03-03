"use client"

import { useState } from "react"
import { MapLayerArtifact } from "@/lib/types"
import { MapLayerList } from "@/components/map-layers/MapLayerList"
import { MapLayerEditor } from "@/components/map-layers/MapLayerEditor"
import { MapLayerViewer } from "@/components/map-layers/MapLayerViewer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useMapLayerContext } from "@/contexts/MapLayerContext"

export default function MapLayersPage() {
  const { mapLayers, createMapLayer, updateMapLayer, deleteMapLayer } = useMapLayerContext()
  const [editingMapLayer, setEditingMapLayer] = useState<MapLayerArtifact | undefined>()
  const [viewingMapLayer, setViewingMapLayer] = useState<MapLayerArtifact | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleCreate = () => {
    setEditingMapLayer(undefined)
    setIsEditorOpen(true)
  }

  const handleEdit = (mapLayer: MapLayerArtifact) => {
    setEditingMapLayer(mapLayer)
    setIsViewerOpen(false)
    setIsEditorOpen(true)
  }

  const handleView = (mapLayer: MapLayerArtifact) => {
    setViewingMapLayer(mapLayer)
    setIsViewerOpen(true)
  }

  const handleSave = async (layerData: Partial<MapLayerArtifact>) => {
    if (layerData.id) {
      // Update existing
      const updated = await updateMapLayer(layerData.id, layerData)
      if (viewingMapLayer?.id === layerData.id) {
        setViewingMapLayer(updated)
      }
    } else {
      // Create new
      await createMapLayer(
        layerData.title || "Untitled",
        layerData.styles || {},
        layerData.sources || [],
        layerData.featureCollection || { type: 'FeatureCollection', features: [] }
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this map layer?")) {
      await deleteMapLayer(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Map Layers</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Map Layer
        </Button>
      </div>

      <MapLayerList
        mapLayers={mapLayers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelect={handleView}
      />

      <MapLayerEditor
        mapLayer={editingMapLayer}
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
      />

      <MapLayerViewer
        mapLayer={viewingMapLayer}
        open={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onEdit={() => viewingMapLayer && handleEdit(viewingMapLayer)}
      />
    </div>
  )
}
