"use client";

import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({
  state,
  className
}: {
  state: SaveState;
  className?: string;
}) {
  if (state === "idle") {
    return <span className={cn("text-xs text-muted-foreground", className)}>Redo att spara</span>;
  }

  if (state === "saving") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-primary", className)}>
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        Sparar...
      </span>
    );
  }

  if (state === "saved") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-emerald-700", className)}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        Sparat
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-destructive", className)}>
      <TriangleAlert className="h-3.5 w-3.5" />
      Fel vid sparande
    </span>
  );
}
