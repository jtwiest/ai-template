"use client";

import Map, { Layer, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapLayerControls } from "./MapLayerControls";
import { useMapContext } from "@/contexts/MapContext";

const SANCTUM_TOKEN = process.env.NEXT_PUBLIC_SANCTUM_TOKEN;

export function MapView() {
	const { sources, visibleLayers, geoJsonData, selectedBasemap, getSelectedStyleUrl } =
		useMapContext();
	const styleUrl = getSelectedStyleUrl();

	return (
		<div className="w-full h-full relative">
			<Map
				mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
				initialViewState={{
					longitude: -98.5795,
					latitude: 39.8283,
					zoom: 4,
				}}
				mapStyle={styleUrl}
				style={{ width: "100%", height: "100%" }}
				onError={e => console.warn("[Map]", e.error?.message)}
				transformRequest={(url, resourceType) => {
					if (!url) return { url };
					if (
						(resourceType === "Source" || resourceType === "Tile") &&
						(url.startsWith("https://maps.") || url.startsWith("https://api."))
					) {
						return {
							url,
							headers: {
								Authorization: `Bearer ${SANCTUM_TOKEN}`,
								"Content-Type": "application/x-www-form-urlencoded",
							},
						};
					}
					return { url };
				}}>
				{/* Render all sources */}
				{sources.map(s => {
					if (s.data_format === "geojson") {
						return (
							<Source
								key={s.handle}
								id={s.handle}
								type="geojson"
								data={
									geoJsonData[s.handle] ?? {
										type: "FeatureCollection",
										features: [],
									}
								}
							/>
						);
					}
					if (["vector", "raster", "raster-dem"].includes(s.data_format)) {
						if (!s.source_url) return null;
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

				{/* Render visible layers — look up styles by basemap ID */}
				{visibleLayers.map(layer => {
					const stylesForBasemap =
						layer.styles?.[selectedBasemap] ??
						Object.values(layer.styles ?? {})[0];
					if (!stylesForBasemap) return null;

					return stylesForBasemap.map((style, idx) => {
						if (!style?.type) return null;
						const layerId = `${layer.id}-style-${idx}`;
						// Only pass defined props — Mapbox rejects undefined layout/filter
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const layerSpec: any = {
							id: layerId,
							source: layer.source,
							type: style.type,
						};
						if (style["source-layer"] != null) layerSpec["source-layer"] = style["source-layer"];
						if (style.paint !== undefined) layerSpec.paint = style.paint;
						if (style.layout !== undefined) layerSpec.layout = style.layout;
						if (style.filter !== undefined) layerSpec.filter = style.filter;
						if (style.minzoom !== undefined) layerSpec.minzoom = style.minzoom;
						if (style.maxzoom !== undefined) layerSpec.maxzoom = style.maxzoom;
						return <Layer key={layerId} {...layerSpec} />;
					});
				})}
			</Map>

			{/* Layer controls FAB — top-left */}
			<div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
				<MapLayerControls />
			</div>
		</div>
	);
}
