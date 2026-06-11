import React, { useState, useEffect } from "react";
import { Server, Cpu, MemoryStick, Activity, Clock } from "lucide-react";

export function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' (UTC+0)';

  return (
    <div className="hidden sm:flex h-8 border-t border-border bg-card items-center justify-between px-4 text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        <span className="font-medium text-foreground">All Systems Operational</span>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden md:flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span>CPU: 23%</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <MemoryStick className="w-3.5 h-3.5" />
          <span>Memory: 41%</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>Data Quality: 99.9%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5" />
          <span>Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-1.5 text-foreground font-medium border-l border-border pl-3 sm:pl-4">
          <Clock className="w-3.5 h-3.5" />
          <span>{timeStr}</span>
        </div>
      </div>
    </div>
  );
}
