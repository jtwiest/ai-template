"use client"

import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { MapLayer } from "@/lib/types"

interface LayerToggleProps {
  layers: MapLayer[]
  visibleLayers: string[]
  onToggle: (layerId: string) => void
}

export function LayerToggle({ layers, visibleLayers, onToggle }: LayerToggleProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full shadow-md" title="Toggle layers">
          <Layers className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-56 p-2">
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Layers</p>
        {layers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-1">No layers available</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {layers.map((layer) => (
              <div key={layer.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm truncate">{layer.name}</p>
                  {layer.description && (
                    <p className="text-xs text-muted-foreground truncate">{layer.description}</p>
                  )}
                </div>
                <Switch
                  checked={visibleLayers.includes(layer.id)}
                  onCheckedChange={() => onToggle(layer.id)}
                />
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
