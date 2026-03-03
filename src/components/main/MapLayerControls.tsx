"use client";

import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { useMapContext } from "@/contexts/MapContext";

export function MapLayerControls() {
	const {
		basemaps,
		sections,
		layers,
		modifiers,
		layerSettings,
		selectedBasemap,
		setSelectedBasemap,
		toggleLayer,
		toggleSection,
		loading,
	} = useMapContext();

	// Track which accordion items are open; auto-expand when sections load
	const [openItems, setOpenItems] = useState<string[]>(["basemap"]);
	useEffect(() => {
		if (sections.length > 0) {
			setOpenItems(prev => {
				const incoming = sections
					.map(s => s.id)
					.filter(id => !prev.includes(id));
				return incoming.length > 0 ? [...prev, ...incoming] : prev;
			});
		}
	}, [sections]);

	const isSectionOn = (sectionId: string): boolean => {
		const section = sections.find(s => s.id === sectionId);
		if (!section) return false;
		return section.layers.every(layerId => layerSettings[layerId] !== false);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="default"
					className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
					title="Layer controls">
					<Layers className="h-6 w-6" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="right"
				align="start"
				className="w-80 p-0 border-border bg-card rounded-md shadow-md">
				{/* Panel header */}
				<div className="flex items-center gap-2 px-3 py-2 border-b border-border">
					<span className="text-lg font-bold uppercase tracking-widest text-foreground">
						Layer Controls
					</span>
				</div>

				<div className="overflow-y-auto max-h-[68vh]">
					<div className="p-2">
						<Accordion
							type="multiple"
							value={openItems}
							onValueChange={setOpenItems}>
							{/* ── Basemap section ── */}
							<AccordionItem value="basemap" className="border-border">
								<AccordionTrigger className="text-xs font-medium uppercase tracking-widest text-foreground hover:text-foreground hover:no-underline px-1 py-2">
									Base Map
								</AccordionTrigger>
								<AccordionContent>
									<RadioGroup
										value={selectedBasemap}
										onValueChange={setSelectedBasemap}
										className="gap-0.5 pb-1">
										{basemaps.map(b => (
											<div
												key={b.id}
												className="flex items-center gap-2.5 px-1 py-1 rounded hover:bg-secondary/50 transition-colors">
												<RadioGroupItem
													value={b.id}
													id={`basemap-${b.id}`}
													disabled={loading}
													className="border-border text-primary"
												/>
												<Label
													htmlFor={`basemap-${b.id}`}
													className="cursor-pointer text-sm font-normal text-foreground tracking-wide">
													{b.name}
												</Label>
											</div>
										))}
									</RadioGroup>

									{/* Modifiers */}
									{modifiers.length > 0 && (
										<div className="mt-1 pt-2 border-t border-border flex flex-col gap-0.5">
											{modifiers.map(mod => (
												<div
													key={mod.id}
													className="w-full flex items-center justify-between gap-3 px-1 py-1 rounded hover:bg-secondary/50 transition-colors">
													<div className="flex-1 min-w-0">
														<p className="text-sm text-foreground tracking-wide">
															{mod.title}
														</p>
													</div>
													<Switch
														checked={layerSettings[mod.id] !== false}
														onCheckedChange={() => toggleLayer(mod.id)}
														disabled={loading}
													/>
												</div>
											))}
										</div>
									)}
								</AccordionContent>
							</AccordionItem>

							{/* ── Layer sections ── */}
							{sections.map(section => {
								const sectionOn = isSectionOn(section.id);
								return (
									<AccordionItem
										key={section.id}
										value={section.id}
										className="border-border">
										<div className="flex items-center gap-2 py-0.5">
											<Switch
												checked={sectionOn}
												onCheckedChange={v => toggleSection(section.id, v)}
												disabled={loading}
												className="shrink-0"
											/>
											<AccordionTrigger className="flex-1 text-xs font-medium uppercase tracking-widest text-foreground hover:text-foreground hover:no-underline py-2">
												{section.title}
											</AccordionTrigger>
										</div>
										<AccordionContent>
											<div className="flex flex-col gap-0.5 pl-1 pb-1">
												{section.layers.map(layerId => {
													const layer = layers.find(l => l.id === layerId);
													if (!layer) return null;
													return (
														<div
															key={layer.id}
															className="w-full flex items-center justify-between gap-3 px-1 py-1 rounded hover:bg-secondary/50 transition-colors">
															<div className="flex-1 min-w-0">
																<p className="text-sm text-foreground tracking-wide">
																	{layer.title}
																</p>
															</div>
															<Switch
																checked={layerSettings[layer.id] !== false}
																onCheckedChange={() => toggleLayer(layer.id)}
																disabled={!layer.allow_toggle || loading}
															/>
														</div>
													);
												})}
											</div>
										</AccordionContent>
									</AccordionItem>
								);
							})}
						</Accordion>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
