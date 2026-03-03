"use client";

import { MapView } from "./MapView";
import { DashboardChat } from "./DashboardChat";
import { DashboardArtifacts } from "./DashboardArtifacts";
import { GenerateReportButton } from "./GenerateReportButton";
import { UtcClock } from "./UtcClock";

function SysLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex-none flex items-center gap-2 px-3 py-2 border-b border-border">
			<span className="text-lg font-bold uppercase tracking-widest text-foreground">
				{children}
			</span>
		</div>
	);
}

export function Main() {
	return (
		<div className="h-screen overflow-hidden flex flex-row bg-background">
			{/* Left — map (70%) */}
			<div className="flex-none w-[70%] relative h-full">
				<MapView />
				{/* Small UTC clock floating top-center over the map */}
				<div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
					<UtcClock />
				</div>
			</div>

			{/* Right — command panel (30%) */}
			<div className="flex-none w-[30%] flex flex-col gap-2 p-2 h-full border-l border-border bg-background overflow-hidden">
				{/* Intel Feed (chat) — 2/3 */}
				<div
					className="flex flex-col rounded-md border border-border bg-card overflow-hidden min-h-0"
					style={{ flex: 2 }}>
					<SysLabel>Chat</SysLabel>
					<DashboardChat />
				</div>

				{/* Artifacts — 1/3 */}
				<div
					className="flex flex-col rounded-md border border-border bg-card overflow-hidden min-h-0"
					style={{ flex: 1 }}>
					<SysLabel>Generated Layers</SysLabel>
					<DashboardArtifacts />
				</div>

				{/* Generate Briefing */}
				<div className="flex-none py-1">
					<GenerateReportButton />
				</div>
			</div>
		</div>
	);
}
