"use client"

import { Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const BASEMAPS = [
  { label: "Streets", url: "mapbox://styles/mapbox/streets-v12" },
  { label: "Satellite", url: "mapbox://styles/mapbox/satellite-streets-v12" },
  { label: "Outdoors", url: "mapbox://styles/mapbox/outdoors-v12" },
  { label: "Dark", url: "mapbox://styles/mapbox/dark-v11" },
  { label: "Light", url: "mapbox://styles/mapbox/light-v11" },
]

interface BasemapPickerProps {
  basemap: string
  onChange: (styleUrl: string) => void
}

export function BasemapPicker({ basemap, onChange }: BasemapPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full shadow-md" title="Change basemap">
          <Map className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-44 p-1">
        <div className="flex flex-col gap-0.5">
          {BASEMAPS.map((b) => (
            <button
              key={b.url}
              onClick={() => onChange(b.url)}
              className={cn(
                "w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                basemap === b.url && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
