"use client";

import { useEffect, useState } from "react";

export function UtcClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getUTCHours().toString().padStart(2, "0");
      const m = now.getUTCMinutes().toString().padStart(2, "0");
      const s = now.getUTCSeconds().toString().padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded px-2.5 py-1 shadow-sm">
      <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        UTC
      </span>
      <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
        {time}
      </span>
    </div>
  );
}
