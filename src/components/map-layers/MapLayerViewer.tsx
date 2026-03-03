import { MapLayer } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit } from "lucide-react"

interface MapLayerViewerProps {
  mapLayer: MapLayer | null
  open: boolean
  onClose: () => void
  onEdit: () => void
}

export function MapLayerViewer({ mapLayer, open, onClose, onEdit }: MapLayerViewerProps) {
  if (!mapLayer) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{mapLayer.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Created {new Date(mapLayer.createdAt).toLocaleDateString()} ·
                Updated {new Date(mapLayer.updatedAt).toLocaleDateString()}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="secondary">
              {mapLayer.sources.length} source{mapLayer.sources.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline">
              {mapLayer.featureCollection.features.length} feature{mapLayer.featureCollection.features.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="styles" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="styles">Styles</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="styles" className="mt-4">
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-sm font-mono">
              {JSON.stringify(mapLayer.styles, null, 2)}
            </pre>
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-sm font-mono">
              {JSON.stringify(mapLayer.sources, null, 2)}
            </pre>
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-sm font-mono">
              {JSON.stringify(mapLayer.featureCollection, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
