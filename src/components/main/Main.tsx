"use client";

import { MapView } from "./MapView";

function SysLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex-none flex items-center gap-2 px-4 py-2.5 border-b border-border">
			<div className="h-1.5 w-1.5 rounded-full bg-primary opacity-80" />
			<span className="text-xs font-medium uppercase tracking-widest text-foreground">
				{children}
			</span>
		</div>
	);
}

function MainChatPlaceholder() {
	return (
		<div className="flex items-center justify-center h-full">
			<span className="text-sm uppercase tracking-widest text-foreground">
				Intel feed offline
			</span>
		</div>
	);
}

function MainArtifactsPlaceholder() {
	return (
		<div className="flex items-center justify-center h-full">
			<span className="text-sm uppercase tracking-widest text-foreground">
				No artifacts
			</span>
		</div>
	);
}

function GenerateReportButtonPlaceholder() {
	return (
		<button
			disabled
			className="w-full h-10 rounded-md border border-border text-foreground text-xs uppercase tracking-widest font-medium cursor-not-allowed transition-all opacity-40">
			Generate Briefing
		</button>
	);
}

export function Main() {
	return (
		<div className="h-screen overflow-hidden flex flex-row bg-background">
			{/* Left column — map (70%) */}
			<div className="flex-none w-[70%] relative h-full">
				<MapView />
			</div>

			{/* Right column — command panel (30%) */}
			<div className="flex-none w-[30%] flex flex-col h-full border-l border-border bg-card">

				{/* Intel Feed — 2/3 of panel */}
				<div
					className="flex flex-col overflow-hidden border-b border-border"
					style={{ flex: 2 }}>
					<SysLabel>Intel Feed</SysLabel>
					<div className="flex-1 overflow-y-auto">
						<MainChatPlaceholder />
					</div>
				</div>

				{/* Artifacts — 1/3 of panel */}
				<div
					className="flex flex-col overflow-hidden border-b border-border"
					style={{ flex: 1 }}>
					<SysLabel>Artifacts</SysLabel>
					<div className="flex-1 overflow-y-auto">
						<MainArtifactsPlaceholder />
					</div>
				</div>

				{/* Generate Briefing — fixed footer */}
				<div className="flex-none px-4 py-[30px]">
					<GenerateReportButtonPlaceholder />
				</div>
			</div>
		</div>
	);
}
