import { MapLayer } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Map, Edit, Trash2 } from "lucide-react"

interface MapLayerCardProps {
  mapLayer: MapLayer
  onEdit: (mapLayer: MapLayer) => void
  onDelete: (id: string) => void
  onClick: (mapLayer: MapLayer) => void
}

export function MapLayerCard({ mapLayer, onEdit, onDelete, onClick }: MapLayerCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onClick(mapLayer)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Map className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{mapLayer.title}</CardTitle>
              <CardDescription className="mt-1">
                Updated {new Date(mapLayer.updatedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(mapLayer)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(mapLayer.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">
            {mapLayer.sources.length} source{mapLayer.sources.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline">
            {mapLayer.featureCollection.features.length} feature{mapLayer.featureCollection.features.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
