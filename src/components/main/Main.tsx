"use client";

import { useEffect, useState } from "react";
import { MapLayer } from "@/lib/types";
import { MapView } from "./MapView";

function MainChatPlaceholder() {
	return (
		<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
			Chat panel
		</div>
	);
}

function MainArtifactsPlaceholder() {
	return (
		<div className="flex items-center justify-center h-full text-muted-foreground text-sm">
			Artifacts panel
		</div>
	);
}

function GenerateReportButtonPlaceholder() {
	return (
		<button
			disabled
			className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground opacity-50 cursor-not-allowed text-sm font-medium">
			Generate Report
		</button>
	);
}

export function Main() {
	const [basemap, setBasemap] = useState("mapbox://styles/mapbox/dark-v11");
	const [layers, setLayers] = useState<MapLayer[]>([]);
	const [visibleLayers, setVisibleLayers] = useState<string[]>([]);

	useEffect(() => {
		fetch("/api/layers")
			.then(res => res.json())
			.then((data: MapLayer[]) => {
				setLayers(data);
				setVisibleLayers(data.map(l => l.id));
			})
			.catch(() => {
				// Silently ignore — stub returns empty array
			});
	}, []);

	const handleLayerToggle = (layerId: string) => {
		setVisibleLayers(prev =>
			prev.includes(layerId)
				? prev.filter(id => id !== layerId)
				: [...prev, layerId],
		);
	};

	return (
		<div className="h-screen overflow-hidden flex flex-row">
			{/* Left column — map (70%) */}
			<div className="flex-none w-[70%] relative h-full">
				<MapView
					layers={layers}
					visibleLayers={visibleLayers}
					onLayerToggle={handleLayerToggle}
					basemap={basemap}
					onBasemapChange={setBasemap}
				/>
			</div>

			{/* Right column — panel (30%) */}
			<div className="flex-none w-[30%] flex flex-col h-full border-l border-border">
				{/* Chat — 2/3 of remaining space, scrollable */}
				<div
					className="flex flex-col overflow-hidden border-b border-border"
					style={{ flex: 2 }}>
					<div className="flex-1 overflow-y-auto">
						<MainChatPlaceholder />
					</div>
				</div>

				{/* Artifacts — 1/3 of remaining space, scrollable */}
				<div
					className="flex flex-col overflow-hidden border-b border-border"
					style={{ flex: 1 }}>
					<div className="flex-1 overflow-y-auto">
						<MainArtifactsPlaceholder />
					</div>
				</div>

				{/* Generate Report — fixed height: 30px padding above and below */}
				<div className="flex-none p-[30px] border-t border-border">
					<GenerateReportButtonPlaceholder />
				</div>
			</div>
		</div>
	);
}
