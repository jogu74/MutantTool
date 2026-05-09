"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { updateStats } from "@/lib/actions/character";
import { calculateTraumaThreshold } from "@/lib/rules";
import { SaveIndicator, type SaveState } from "@/components/character/save-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StatsForm = {
  strength: number;
  physique: number;
  size: number;
  agility: number;
  intelligence: number;
  willpower: number;
  personality: number;
  damageBonus: number;
  initiativeBonus: number;
  carryingCapacity: number;
  reactionValue: number;
};

const editableKeys = [
  ["strength", "Styrka"],
  ["physique", "Fysik"],
  ["size", "Storlek"],
  ["agility", "Smidighet"],
  ["intelligence", "Intelligens"],
  ["willpower", "Vilja"],
  ["personality", "Personlighet"]
] as const;

export function StatsSection({
  characterId,
  version,
  initialStats,
  traumaThreshold,
  manualTraumaThreshold
}: {
  characterId: string;
  version: string;
  initialStats: StatsForm | null;
  traumaThreshold: number;
  manualTraumaThreshold: number | null;
}) {
  const [stats, setStats] = useState<StatsForm>(
    initialStats ?? {
      strength: 0,
      physique: 0,
      size: 0,
      agility: 0,
      intelligence: 0,
      willpower: 0,
      personality: 0,
      damageBonus: 0,
      initiativeBonus: 0,
      carryingCapacity: 0,
      reactionValue: 0
    }
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
    }
  }, [initialStats, version]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const calculatedTrauma = useMemo(
    () => calculateTraumaThreshold(stats.physique, stats.willpower),
    [stats.physique, stats.willpower]
  );

  async function commit(next: StatsForm) {
    try {
      setSaveState("saving");
      await updateStats({
        characterId,
        strength: next.strength,
        physique: next.physique,
        size: next.size,
        agility: next.agility,
        intelligence: next.intelligence,
        willpower: next.willpower,
        personality: next.personality
      });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte spara grundegenskaperna.");
    }
  }

  function scheduleSave(next: StatsForm) {
    setStats(next);
    setSaveState("saving");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void commit(next);
    }, 700);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Grundegenskaper</CardTitle>
        <SaveIndicator state={saveState} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {editableKeys.map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                value={stats[key]}
                onChange={(event) =>
                  scheduleSave({
                    ...stats,
                    [key]: Number(event.target.value)
                  })
                }
              />
            </div>
          ))}
        </div>
        <div className="grid gap-3 rounded-2xl border bg-background/60 p-4 md:grid-cols-5">
          <StatPill label="Skadebonus" value={stats.damageBonus} />
          <StatPill label="Initiativbonus" value={stats.initiativeBonus} />
          <StatPill label="Bärförmåga" value={stats.carryingCapacity} />
          <StatPill label="Reaktionsvärde" value={stats.reactionValue} />
          <StatPill
            label={manualTraumaThreshold !== null ? "Trauma-tröskel (manuell)" : "Trauma-tröskel"}
            value={manualTraumaThreshold ?? traumaThreshold ?? calculatedTrauma}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
