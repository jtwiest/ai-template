"use client";

import { MapView } from "./MapView";
import { DashboardChat } from "./DashboardChat";
import { DashboardArtifacts } from "./DashboardArtifacts";
import { GenerateReportButton } from "./GenerateReportButton";
import { UtcClock } from "./UtcClock";
import { useArtifactContext } from "@/contexts/ArtifactContext";
import { useChatContext } from "@/contexts/ChatContext";

function SysLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex-none flex items-center gap-2 px-3 py-2 border-b border-border">
			<span className="text-lg font-bold uppercase tracking-widest text-foreground">
				{children}
			</span>
		</div>
	);
}

function ClearAllButton() {
	const { artifacts, deleteArtifact } = useArtifactContext();
	const { sessions, deleteSession } = useChatContext();

	const handleClearAll = () => {
		artifacts.forEach(a => deleteArtifact(a.id));
		sessions.forEach(s => deleteSession(s.id));
	};

	const isEmpty = artifacts.length === 0 && sessions.length === 0;

	return (
		<button
			onClick={handleClearAll}
			disabled={isEmpty}
			className="w-full h-10 rounded-md border border-border text-foreground text-xs uppercase tracking-widest font-medium transition-all hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed">
			Clear All
		</button>
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

				{/* Clear All — very top */}
				<div className="flex-none">
					<ClearAllButton />
				</div>

				{/* Generate Briefing */}
				<div className="flex-none py-1">
					<GenerateReportButton />
				</div>

				{/* Generated Layers — fills most of the space */}
				<div
					className="flex flex-col rounded-md border border-border bg-card overflow-hidden min-h-0"
					style={{ flex: 1 }}>
					<SysLabel>Generated Layers</SysLabel>
					<DashboardArtifacts />
				</div>

				{/* Chat — compact at bottom */}
				<div
					className="flex flex-col rounded-md border border-border bg-card overflow-hidden min-h-0"
					style={{ flex: 1 }}>
					<SysLabel>Chat</SysLabel>
					<DashboardChat />
				</div>

			</div>
		</div>
	);
}
