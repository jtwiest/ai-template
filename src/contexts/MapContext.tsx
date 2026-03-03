"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	MapBasemap,
	MapLayerConfig,
	MapModifier,
	MapRegion,
	MapSection,
	MapSource,
} from "@/lib/types";
import {
	getLayerSettingsFromLS,
	getSelectedBasemapFromLS,
	getVisibleLayers,
	initializeLayerSettings,
	saveLayerSettingsToLS,
	saveSelectedBasemapToLS,
	setSectionLayerSettings,
	toggleLayerSetting,
} from "@/lib/mapUtils";

const ALOFT_API_BASE = process.env.NEXT_PUBLIC_ALOFT_API_BASE_URL;
const SANCTUM_TOKEN = process.env.NEXT_PUBLIC_SANCTUM_TOKEN;
const GEOJSON_POLL_INTERVAL_MS = 30_000;

interface MapContextState {
	sources: MapSource[];
	layers: MapLayerConfig[];
	sections: MapSection[];
	basemaps: MapBasemap[];
	modifiers: MapModifier[];
	regions: MapRegion[];
	selectedBasemap: string;
	visibleLayers: MapLayerConfig[];
	layerSettings: Record<string, boolean>;
	geoJsonData: Record<string, GeoJSON.FeatureCollection>;
	loading: boolean;
	error: string | null;
}

interface MapContextType extends MapContextState {
	fetchMapData: () => Promise<void>;
	toggleLayer: (layerId: string) => void;
	toggleSection: (sectionId: string, value: boolean) => void;
	setSelectedBasemap: (basemapId: string) => void;
	getSelectedStyleUrl: () => string;
}

const MapContext = createContext<MapContextType | null>(null);

export function useMapContext(): MapContextType {
	const ctx = useContext(MapContext);
	if (!ctx) throw new Error("useMapContext must be used within MapProvider");
	return ctx;
}

export function MapProvider({ children }: { children: React.ReactNode }) {
	const [sources, setSources] = useState<MapSource[]>([]);
	const [layers, setLayers] = useState<MapLayerConfig[]>([]);
	const [sections, setSections] = useState<MapSection[]>([]);
	const [basemaps, setBasemaps] = useState<MapBasemap[]>([]);
	const [modifiers, setModifiers] = useState<MapModifier[]>([]);
	const [regions, setRegions] = useState<MapRegion[]>([]);
	const [selectedBasemap, setSelectedBasemapState] = useState<string>("");
	const [layerSettings, setLayerSettings] = useState<Record<string, boolean>>(
		{},
	);
	const [visibleLayers, setVisibleLayers] = useState<MapLayerConfig[]>([]);
	const [geoJsonData, setGeoJsonData] = useState<
		Record<string, GeoJSON.FeatureCollection>
	>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const geoJsonSourcesRef = useRef<MapSource[]>([]);
	const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const layersRef = useRef<MapLayerConfig[]>([]);
	const modifiersRef = useRef<MapModifier[]>([]);

	const recomputeVisible = useCallback(
		(
			allLayers: MapLayerConfig[],
			allModifiers: MapModifier[],
			settings: Record<string, boolean>,
		) => {
			setVisibleLayers(getVisibleLayers({ allLayers, allModifiers, settings }));
		},
		[],
	);

	const fetchGeoJson = useCallback(async (geoJsonSources: MapSource[]) => {
		for (const src of geoJsonSources) {
			if (!src.source_url) continue;
			try {
				const res = await fetch(src.source_url);
				if (!res.ok) continue;
				const data = (await res.json()) as GeoJSON.FeatureCollection;
				setGeoJsonData(prev => ({ ...prev, [src.handle]: data }));
			} catch {
				// ignore individual fetch failures
			}
		}
	}, []);

	const startGeoJsonPolling = useCallback(
		(geoJsonSources: MapSource[]) => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
			if (geoJsonSources.length === 0) return;

			// Fetch immediately, then on interval
			fetchGeoJson(geoJsonSources);
			pollIntervalRef.current = setInterval(() => {
				fetchGeoJson(geoJsonSources);
			}, GEOJSON_POLL_INTERVAL_MS);
		},
		[fetchGeoJson],
	);

	const fetchMapData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`${ALOFT_API_BASE}/v1/airspace/maps?context=airaware`,
				{
					headers: {
						Authorization: `Bearer ${SANCTUM_TOKEN}`,
						"Content-Type": "application/x-www-form-urlencoded",
					},
				},
			);
			if (!res.ok) throw new Error(`API error ${res.status}`);

			const json = (await res.json()) as {
				data?: {
					sources?: MapSource[];
					layers?: MapLayerConfig[];
					sections?: MapSection[];
					base_maps?: MapBasemap[];
					modifiers?: MapModifier[];
					regions?: MapRegion[];
				};
			};

			const data = json.data ?? {};
			const fetchedSources = data.sources ?? [];
			const fetchedLayers = data.layers ?? [];
			const fetchedSections = data.sections ?? [];
			const fetchedBasemaps =
				data.base_maps?.map(b => {
					if (b.name === "Air Control Light") {
						return {
							...b,
							name: "Light",
						};
					}
					return b;
				}) ?? [];
			const fetchedModifiers = data.modifiers ?? [];
			const fetchedRegions = data.regions ?? [];

			setSources(fetchedSources);
			layersRef.current = fetchedLayers;
			modifiersRef.current = fetchedModifiers;
			setLayers(fetchedLayers);
			setSections(fetchedSections);
			setBasemaps(fetchedBasemaps);
			setModifiers(fetchedModifiers);
			setRegions(fetchedRegions);

			// Restore or pick default basemap
			const savedBasemap = getSelectedBasemapFromLS();
			const defaultBasemap =
				fetchedBasemaps.find(b => b.is_default)?.id ??
				fetchedBasemaps[0]?.id ??
				"";
			const resolvedBasemap = savedBasemap ?? defaultBasemap;
			setSelectedBasemapState(resolvedBasemap);

			// Restore + initialize layer settings
			const existing = getLayerSettingsFromLS();
			const merged = initializeLayerSettings({
				allLayers: fetchedLayers,
				allModifiers: fetchedModifiers,
				existingSettings: existing,
			});
			setLayerSettings(merged);
			recomputeVisible(fetchedLayers, fetchedModifiers, merged);

			// Start GeoJSON polling for geojson sources
			const geoJsonSources = fetchedSources.filter(
				s => s.data_format === "geojson",
			);
			geoJsonSourcesRef.current = geoJsonSources;
			startGeoJsonPolling(geoJsonSources);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch map data");
		} finally {
			setLoading(false);
		}
	}, [recomputeVisible, startGeoJsonPolling]);

	// Fetch on mount
	useEffect(() => {
		fetchMapData();
		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
		};
	}, [fetchMapData]);

	const toggleLayer = useCallback(
		(layerId: string) => {
			setLayerSettings(prev => {
				const updated = toggleLayerSetting({ settings: prev, layerId });
				saveLayerSettingsToLS(updated);
				recomputeVisible(layersRef.current, modifiersRef.current, updated);
				return updated;
			});
		},
		[recomputeVisible],
	);

	const toggleSection = useCallback(
		(sectionId: string, value: boolean) => {
			const section = sections.find(s => s.id === sectionId);
			if (!section) return;
			setLayerSettings(prev => {
				const updated = setSectionLayerSettings({
					settings: prev,
					section,
					allLayers: layers,
					value,
				});
				saveLayerSettingsToLS(updated);
				recomputeVisible(layers, modifiers, updated);
				return updated;
			});
		},
		[sections, layers, modifiers, recomputeVisible],
	);

	const setSelectedBasemap = useCallback((basemapId: string) => {
		setSelectedBasemapState(basemapId);
		saveSelectedBasemapToLS(basemapId);
	}, []);

	const getSelectedStyleUrl = useCallback((): string => {
		const found = basemaps.find(b => b.id === selectedBasemap);
		return found?.mapbox_path ?? "mapbox://styles/mapbox/dark-v11";
	}, [basemaps, selectedBasemap]);

	return (
		<MapContext.Provider
			value={{
				sources,
				layers,
				sections,
				basemaps,
				modifiers,
				regions,
				selectedBasemap,
				visibleLayers,
				layerSettings,
				geoJsonData,
				loading,
				error,
				fetchMapData,
				toggleLayer,
				toggleSection,
				setSelectedBasemap,
				getSelectedStyleUrl,
			}}>
			{children}
		</MapContext.Provider>
	);
}
