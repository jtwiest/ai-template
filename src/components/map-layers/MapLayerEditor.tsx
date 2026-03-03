"use client"

import { useState, useEffect } from "react"
import { MapLayer, MapLayerSource, GeoJSONFeatureCollection } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MapLayerEditorProps {
  mapLayer?: MapLayer
  open: boolean
  onClose: () => void
  onSave: (layerData: Partial<MapLayer>) => void
}

const DEFAULT_FEATURE_COLLECTION: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: []
}

export function MapLayerEditor({ mapLayer, open, onClose, onSave }: MapLayerEditorProps) {
  const [title, setTitle] = useState(mapLayer?.title || "")
  const [stylesJson, setStylesJson] = useState(
    mapLayer?.styles ? JSON.stringify(mapLayer.styles, null, 2) : "{}"
  )
  const [sourcesJson, setSourcesJson] = useState(
    mapLayer?.sources ? JSON.stringify(mapLayer.sources, null, 2) : "[]"
  )
  const [featureCollectionJson, setFeatureCollectionJson] = useState(
    mapLayer?.featureCollection
      ? JSON.stringify(mapLayer.featureCollection, null, 2)
      : JSON.stringify(DEFAULT_FEATURE_COLLECTION, null, 2)
  )
  const [errors, setErrors] = useState<{ styles?: string; sources?: string; featureCollection?: string }>({})

  // Update state when mapLayer prop changes
  useEffect(() => {
    setTitle(mapLayer?.title || "")
    setStylesJson(mapLayer?.styles ? JSON.stringify(mapLayer.styles, null, 2) : "{}")
    setSourcesJson(mapLayer?.sources ? JSON.stringify(mapLayer.sources, null, 2) : "[]")
    setFeatureCollectionJson(
      mapLayer?.featureCollection
        ? JSON.stringify(mapLayer.featureCollection, null, 2)
        : JSON.stringify(DEFAULT_FEATURE_COLLECTION, null, 2)
    )
    setErrors({})
  }, [mapLayer])

  const validateJson = () => {
    const newErrors: { styles?: string; sources?: string; featureCollection?: string } = {}

    try {
      JSON.parse(stylesJson)
    } catch {
      newErrors.styles = "Invalid JSON"
    }

    try {
      const sources = JSON.parse(sourcesJson)
      if (!Array.isArray(sources)) {
        newErrors.sources = "Must be an array"
      }
    } catch {
      newErrors.sources = "Invalid JSON"
    }

    try {
      const fc = JSON.parse(featureCollectionJson)
      if (fc.type !== 'FeatureCollection') {
        newErrors.featureCollection = "Must be a FeatureCollection"
      }
    } catch {
      newErrors.featureCollection = "Invalid JSON"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateJson()) return

    onSave({
      id: mapLayer?.id,
      title,
      styles: JSON.parse(stylesJson),
      sources: JSON.parse(sourcesJson) as MapLayerSource[],
      featureCollection: JSON.parse(featureCollectionJson) as GeoJSONFeatureCollection,
    })
    handleClose()
  }

  const handleClose = () => {
    setTitle(mapLayer?.title || "")
    setStylesJson(mapLayer?.styles ? JSON.stringify(mapLayer.styles, null, 2) : "{}")
    setSourcesJson(mapLayer?.sources ? JSON.stringify(mapLayer.sources, null, 2) : "[]")
    setFeatureCollectionJson(
      mapLayer?.featureCollection
        ? JSON.stringify(mapLayer.featureCollection, null, 2)
        : JSON.stringify(DEFAULT_FEATURE_COLLECTION, null, 2)
    )
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mapLayer ? "Edit Map Layer" : "Create Map Layer"}</DialogTitle>
          <DialogDescription>
            {mapLayer
              ? "Make changes to your map layer"
              : "Create a new map layer with GeoJSON data"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter map layer title..."
            />
          </div>

          <Tabs defaultValue="styles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="styles">Styles</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="styles" className="space-y-2">
              <Label htmlFor="styles">Styles (JSON)</Label>
              <Textarea
                id="styles"
                value={stylesJson}
                onChange={(e) => setStylesJson(e.target.value)}
                placeholder='{"color": "#ff0000", "opacity": 0.8}'
                className="min-h-[200px] font-mono text-sm"
              />
              {errors.styles && (
                <p className="text-sm text-destructive">{errors.styles}</p>
              )}
            </TabsContent>

            <TabsContent value="sources" className="space-y-2">
              <Label htmlFor="sources">Sources (JSON Array)</Label>
              <Textarea
                id="sources"
                value={sourcesJson}
                onChange={(e) => setSourcesJson(e.target.value)}
                placeholder='[{"id": "main", "type": "geojson"}]'
                className="min-h-[200px] font-mono text-sm"
              />
              {errors.sources && (
                <p className="text-sm text-destructive">{errors.sources}</p>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-2">
              <Label htmlFor="features">Feature Collection (GeoJSON)</Label>
              <Textarea
                id="features"
                value={featureCollectionJson}
                onChange={(e) => setFeatureCollectionJson(e.target.value)}
                placeholder='{"type": "FeatureCollection", "features": []}'
                className="min-h-[200px] font-mono text-sm"
              />
              {errors.featureCollection && (
                <p className="text-sm text-destructive">{errors.featureCollection}</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {mapLayer ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
