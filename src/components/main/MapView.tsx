"use client"

import Map from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { BasemapPicker } from "./BasemapPicker"
import { LayerToggle } from "./LayerToggle"
import { MapLayer } from "@/lib/types"

interface MapViewProps {
  layers: MapLayer[]
  visibleLayers: string[]
  onLayerToggle: (layerId: string) => void
  basemap: string
  onBasemapChange: (styleUrl: string) => void
}

export function MapView({ layers, visibleLayers, onLayerToggle, basemap, onBasemapChange }: MapViewProps) {
  return (
    <div className="w-full h-full relative">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -98.5795,
          latitude: 39.8283,
          zoom: 4,
        }}
        mapStyle={basemap}
        style={{ width: "100%", height: "100%" }}
      />

      {/* FABs — top-left overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <BasemapPicker basemap={basemap} onChange={onBasemapChange} />
        <LayerToggle layers={layers} visibleLayers={visibleLayers} onToggle={onLayerToggle} />
      </div>
    </div>
  )
}
