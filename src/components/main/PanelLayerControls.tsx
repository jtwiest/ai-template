"use client";

import { useEffect, useState } from "react";
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

export function PanelLayerControls() {
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

  const [openItems, setOpenItems] = useState<string[]>(["basemap"]);

  useEffect(() => {
    if (sections.length > 0) {
      setOpenItems(prev => {
        const incoming = sections.map(s => s.id).filter(id => !prev.includes(id));
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
    <div className="overflow-y-auto flex-1 min-h-0">
      <div className="p-2">
        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}>

          {/* ── Basemap ── */}
          <AccordionItem value="basemap" className="border-border">
            <AccordionTrigger className="text-[10px] font-medium uppercase tracking-widest text-foreground hover:text-foreground hover:no-underline px-1 py-2">
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
                      id={`panel-basemap-${b.id}`}
                      disabled={loading}
                      className="border-border text-primary"
                    />
                    <Label
                      htmlFor={`panel-basemap-${b.id}`}
                      className="cursor-pointer text-xs font-normal text-foreground tracking-wide">
                      {b.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {modifiers.length > 0 && (
                <div className="mt-1 pt-2 border-t border-border flex flex-col gap-0.5">
                  {modifiers.map(mod => (
                    <div
                      key={mod.id}
                      className="w-full flex items-center justify-between gap-3 px-1 py-1 rounded hover:bg-secondary/50 transition-colors">
                      <p className="text-xs text-foreground tracking-wide">{mod.title}</p>
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
              <AccordionItem key={section.id} value={section.id} className="border-border">
                <div className="flex items-center gap-2 py-0.5">
                  <Switch
                    checked={sectionOn}
                    onCheckedChange={v => toggleSection(section.id, v)}
                    disabled={loading}
                    className="shrink-0"
                  />
                  <AccordionTrigger className="flex-1 text-[10px] font-medium uppercase tracking-widest text-foreground hover:text-foreground hover:no-underline py-2">
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
                          <p className="text-xs text-foreground tracking-wide">{layer.title}</p>
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
  );
}
