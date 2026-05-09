"use client";

import { Textarea } from "@/components/ui/textarea";

export function NotesSection({
  notes,
  onChange
}: {
  notes: string;
  onChange: (value: string) => void;
}) {
  return (
    <Textarea
      value={notes}
      onChange={(event) => onChange(event.target.value)}
      rows={8}
      placeholder="Övriga anteckningar, allierade, pågående trådar..."
      className="min-h-[220px]"
    />
  );
}
