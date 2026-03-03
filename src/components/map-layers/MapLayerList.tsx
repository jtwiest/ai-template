import { MapLayerArtifact } from "@/lib/types"
import { MapLayerCard } from "./MapLayerCard"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

interface MapLayerListProps {
  mapLayers: MapLayerArtifact[]
  onEdit: (mapLayer: MapLayerArtifact) => void
  onDelete: (id: string) => void
  onSelect: (mapLayer: MapLayerArtifact) => void
}

export function MapLayerList({ mapLayers, onEdit, onDelete, onSelect }: MapLayerListProps) {
  const [search, setSearch] = useState("")

  const filteredLayers = mapLayers.filter(
    (layer) =>
      layer.title.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(layer.styles).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search map layers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredLayers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{search ? "No map layers found" : "No map layers yet"}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLayers.map((layer) => (
            <MapLayerCard
              key={layer.id}
              mapLayer={layer}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
