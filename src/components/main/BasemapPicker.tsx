"use client";

import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMapContext } from "@/contexts/MapContext";

// Fallback basemaps if the API returns none
const FALLBACK_BASEMAPS = [
	{
		id: "streets",
		name: "Streets",
		mapbox_path: "mapbox://styles/mapbox/streets-v12",
	},
	{
		id: "satellite",
		name: "Satellite",
		mapbox_path: "mapbox://styles/mapbox/satellite-streets-v12",
	},
	{
		id: "outdoors",
		name: "Outdoors",
		mapbox_path: "mapbox://styles/mapbox/outdoors-v12",
	},
	{ id: "dark", name: "Dark", mapbox_path: "mapbox://styles/mapbox/dark-v11" },
	{
		id: "light",
		name: "Light",
		mapbox_path: "mapbox://styles/mapbox/light-v11",
	},
];

export function BasemapPicker() {
	const { basemaps, selectedBasemap, setSelectedBasemap } = useMapContext();
	const options = basemaps.length > 0 ? basemaps : FALLBACK_BASEMAPS;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					className="rounded-full shadow-md"
					title="Change basemap">
					<Map className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent side="right" align="start" className="w-44 p-1">
				<div className="flex flex-col gap-0.5">
					{options.map(b => (
						<button
							key={b.id}
							onClick={() => setSelectedBasemap(b.id)}
							className={cn(
								"w-full rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
								selectedBasemap === b.id &&
									"bg-accent text-accent-foreground font-medium",
							)}>
							{b.name}
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
