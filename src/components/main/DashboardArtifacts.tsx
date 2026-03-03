"use client";

import { useArtifactContext } from "@/contexts/ArtifactContext";
import { ArtifactCard } from "@/components/artifacts/ArtifactCard";

export function DashboardArtifacts() {
  const { artifacts } = useArtifactContext();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
      {artifacts.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xs uppercase tracking-widest text-foreground opacity-40">
            No artifacts yet
          </p>
        </div>
      ) : (
        artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            onEdit={() => {}}
            onDelete={() => {}}
            onClick={() => {}}
          />
        ))
      )}
    </div>
  );
}
