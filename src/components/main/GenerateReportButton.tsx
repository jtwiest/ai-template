"use client";

import { useState } from "react";
import { useArtifactContext } from "@/contexts/ArtifactContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function GenerateReportButton() {
  const { artifacts } = useArtifactContext();

  const [open, setOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleOpen = () => {
    setReportTitle("");
    setSelectedIds(artifacts.map((a) => a.id));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReportTitle("");
    setSelectedIds([]);
  };

  const toggleArtifact = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    console.log("Generate report:", { reportTitle, selectedIds });
    handleClose();
  };

  const canGenerate = reportTitle.trim().length > 0 && selectedIds.length > 0;

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={artifacts.length === 0}
        className="w-full h-10 rounded-md border border-border text-foreground text-xs uppercase tracking-widest font-medium transition-all hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Generate Briefing
      </button>

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Briefing</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="report-title">Title</Label>
              <Input
                id="report-title"
                placeholder="Enter briefing title..."
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Include Artifacts</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {artifacts.map((artifact) => (
                  <div key={artifact.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`artifact-${artifact.id}`}
                      checked={selectedIds.includes(artifact.id)}
                      onCheckedChange={() => toggleArtifact(artifact.id)}
                    />
                    <Label
                      htmlFor={`artifact-${artifact.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {artifact.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!canGenerate}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
