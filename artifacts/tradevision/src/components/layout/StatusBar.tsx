import React from "react";
import { Server, Cpu, MemoryStick, Activity, Clock } from "lucide-react";

export function StatusBar() {
  return (
    <div className="h-8 border-t border-border bg-card flex items-center justify-between px-4 text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success"></div>
        <span className="font-medium text-foreground">All Systems Operational</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span>CPU: 23%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MemoryStick className="w-3.5 h-3.5" />
          <span>Memory: 41%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>Data Quality: 99.9%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5" />
          <span>Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-1.5 text-foreground font-medium border-l border-border pl-4">
          <Clock className="w-3.5 h-3.5" />
          <span>10:30:45 AM (UTC+0)</span>
        </div>
      </div>
    </div>
  );
}