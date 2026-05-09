"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { toast } from "sonner";

import { ArmorSection } from "@/components/character/ArmorSection";
import { EquipmentSection } from "@/components/character/EquipmentSection";
import { NotesSection } from "@/components/character/NotesSection";
import { SaveIndicator, type SaveState } from "@/components/character/save-indicator";
import { SkillsSection } from "@/components/character/SkillsSection";
import { StatsSection } from "@/components/character/StatsSection";
import { WeaponsSection } from "@/components/character/WeaponsSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { calculateTotalCarriedWeight } from "@/lib/rules";
import { updateCharacter } from "@/lib/actions/character";
import type { SerializedCharacter } from "@/lib/serializers";

type BaseForm = {
  name: string;
  playerName: string;
  className: string;
  formerOccupation: string;
  home: string;
  age: string;
  gender: string;
  length: string;
  weight: string;
  appearance: string;
  reputation: string;
  status: string;
  bodyPoints: number;
  traumaThresholdManual: string;
  kroncreditsOnHand: number;
  kroncreditsStash: number;
  creditsOnHand: number;
  creditsStash: number;
  jacksOnHand: number;
  jacksStash: number;
  notes: string;
};

function toBaseForm(character: SerializedCharacter): BaseForm {
  return {
    name: character.name,
    playerName: character.playerName,
    className: character.className ?? "",
    formerOccupation: character.formerOccupation ?? "",
    home: character.home ?? "",
    age: character.age ?? "",
    gender: character.gender ?? "",
    length: character.length ?? "",
    weight: character.weight ?? "",
    appearance: character.appearance ?? "",
    reputation: character.reputation ?? "",
    status: character.status ?? "",
    bodyPoints: character.bodyPoints,
    traumaThresholdManual:
      character.traumaThresholdManual === null || character.traumaThresholdManual === undefined
        ? ""
        : String(character.traumaThresholdManual),
    kroncreditsOnHand: character.kroncreditsOnHand,
    kroncreditsStash: character.kroncreditsStash,
    creditsOnHand: character.creditsOnHand,
    creditsStash: character.creditsStash,
    jacksOnHand: character.jacksOnHand,
    jacksStash: character.jacksStash,
    notes: character.notes ?? ""
  };
}

export function CharacterSheet({
  character,
  mode
}: {
  character: SerializedCharacter;
  mode: "player" | "admin";
}) {
  const router = useRouter();
  const [form, setForm] = useState<BaseForm>(() => toBaseForm(character));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm(toBaseForm(character));
  }, [character]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const totalCarriedWeight = useMemo(
    () =>
      calculateTotalCarriedWeight({
        equipment: character.equipmentItems,
        armor: character.armorItems,
        weapons: character.weapons
      }),
    [character]
  );

  async function commit(next: BaseForm) {
    try {
      setSaveState("saving");
      await updateCharacter({
        characterId: character.id,
        name: next.name,
        playerName: next.playerName,
        className: next.className || null,
        formerOccupation: next.formerOccupation || null,
        home: next.home || null,
        age: next.age || null,
        gender: next.gender || null,
        length: next.length || null,
        weight: next.weight || null,
        appearance: next.appearance || null,
        reputation: next.reputation || null,
        status: next.status || null,
        bodyPoints: next.bodyPoints,
        traumaThresholdManual: next.traumaThresholdManual === "" ? null : Number(next.traumaThresholdManual),
        traumaThreshold: next.traumaThresholdManual === "" ? character.traumaThreshold : Number(next.traumaThresholdManual),
        kroncreditsOnHand: next.kroncreditsOnHand,
        kroncreditsStash: next.kroncreditsStash,
        creditsOnHand: next.creditsOnHand,
        creditsStash: next.creditsStash,
        jacksOnHand: next.jacksOnHand,
        jacksStash: next.jacksStash,
        notes: next.notes || null
      });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte spara karaktärsinformationen.");
    }
  }

  function scheduleSave(next: BaseForm) {
    setForm(next);
    setSaveState("saving");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void commit(next);
    }, 700);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/15">
        <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
                  {character.campaign.name}
                </p>
                <h1 className="mt-3 font-display text-4xl">{character.name}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Spelare: {character.playerName} {mode === "admin" ? "· Adminvy" : ""}
                </p>
              </div>
              <div className="space-y-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {mode === "admin" ? (
                    <Badge variant="outline">
                      <Shield className="mr-1 h-3.5 w-3.5" />
                      Admin
                    </Badge>
                  ) : null}
                  <SaveIndicator state={saveState} />
                </div>
                {mode === "admin" ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/app/admin">Tillbaka till admin</Link>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <QuickStat label="KP" value={String(form.bodyPoints)} />
              <QuickStat label="Trauma-tröskel" value={String(form.traumaThresholdManual || character.traumaThreshold)} />
              <QuickStat label="Bärvikt" value={totalCarriedWeight.toFixed(1)} />
              <QuickStat label="Ryktestatus" value={form.reputation || "Ej satt"} />
              <QuickStat label="Status" value={form.status || "Ingen"} />
              <QuickStat label="Hemort" value={form.home || "Okänd"} />
            </div>
          </div>
          <div className="rounded-[1.5rem] border bg-background/70 p-4">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-primary">Kampanjöversikt</p>
            <div className="mt-4 grid gap-3">
              <QuickPill label="Kronkredit" value={`${form.kroncreditsOnHand} / ${form.kroncreditsStash}`} />
              <QuickPill label="Kredit" value={`${form.creditsOnHand} / ${form.creditsStash}`} />
              <QuickPill label="Jycke" value={`${form.jacksOnHand} / ${form.jacksStash}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Persondata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <FormField label="Namn">
                <Input value={form.name} onChange={(event) => scheduleSave({ ...form, name: event.target.value })} />
              </FormField>
              <FormField label="Spelare">
                <Input
                  value={form.playerName}
                  readOnly={mode !== "admin"}
                  onChange={(event) => scheduleSave({ ...form, playerName: event.target.value })}
                  className={mode !== "admin" ? "bg-muted" : undefined}
                />
              </FormField>
              <FormField label="Klass">
                <Input value={form.className} onChange={(event) => scheduleSave({ ...form, className: event.target.value })} />
              </FormField>
              <FormField label="Tidigare yrke">
                <Input
                  value={form.formerOccupation}
                  onChange={(event) => scheduleSave({ ...form, formerOccupation: event.target.value })}
                />
              </FormField>
              <FormField label="Hemort">
                <Input value={form.home} onChange={(event) => scheduleSave({ ...form, home: event.target.value })} />
              </FormField>
              <FormField label="Ålder">
                <Input value={form.age} onChange={(event) => scheduleSave({ ...form, age: event.target.value })} />
              </FormField>
              <FormField label="Kön">
                <Input value={form.gender} onChange={(event) => scheduleSave({ ...form, gender: event.target.value })} />
              </FormField>
              <FormField label="Längd">
                <Input value={form.length} onChange={(event) => scheduleSave({ ...form, length: event.target.value })} />
              </FormField>
              <FormField label="Vikt">
                <Input value={form.weight} onChange={(event) => scheduleSave({ ...form, weight: event.target.value })} />
              </FormField>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FormField label="Rykte">
                <Input value={form.reputation} onChange={(event) => scheduleSave({ ...form, reputation: event.target.value })} />
              </FormField>
              <FormField label="Status">
                <Input value={form.status} onChange={(event) => scheduleSave({ ...form, status: event.target.value })} />
              </FormField>
              <FormField label="Kroppspoäng">
                <Input
                  type="number"
                  value={form.bodyPoints}
                  onChange={(event) => scheduleSave({ ...form, bodyPoints: Number(event.target.value) })}
                />
              </FormField>
              <FormField label="Manuell trauma-tröskel">
                <Input
                  type="number"
                  placeholder={`Auto: ${character.traumaThreshold}`}
                  value={form.traumaThresholdManual}
                  onChange={(event) => scheduleSave({ ...form, traumaThresholdManual: event.target.value })}
                />
              </FormField>
            </div>
            <FormField label="Utseende">
              <Input value={form.appearance} onChange={(event) => scheduleSave({ ...form, appearance: event.target.value })} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MoneyRow
              label="Kronkredit"
              onHand={form.kroncreditsOnHand}
              stash={form.kroncreditsStash}
              onChange={(values) => scheduleSave({ ...form, ...values })}
              keys={["kroncreditsOnHand", "kroncreditsStash"]}
            />
            <MoneyRow
              label="Kredit"
              onHand={form.creditsOnHand}
              stash={form.creditsStash}
              onChange={(values) => scheduleSave({ ...form, ...values })}
              keys={["creditsOnHand", "creditsStash"]}
            />
            <MoneyRow
              label="Jycke"
              onHand={form.jacksOnHand}
              stash={form.jacksStash}
              onChange={(values) => scheduleSave({ ...form, ...values })}
              keys={["jacksOnHand", "jacksStash"]}
            />
          </CardContent>
        </Card>
      </div>

      <StatsSection
        characterId={character.id}
        version={character.updatedAt.toString()}
        initialStats={character.stats}
        traumaThreshold={character.traumaThreshold}
        manualTraumaThreshold={character.traumaThresholdManual}
      />
      <SkillsSection characterId={character.id} version={character.updatedAt.toString()} skills={character.skills} />
      <WeaponsSection characterId={character.id} version={character.updatedAt.toString()} weapons={character.weapons} />
      <EquipmentSection
        characterId={character.id}
        version={character.updatedAt.toString()}
        items={character.equipmentItems}
      />
      <ArmorSection characterId={character.id} version={character.updatedAt.toString()} items={character.armorItems} />
      <Card>
        <CardHeader>
          <CardTitle>Övriga anteckningar</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesSection notes={form.notes} onChange={(notes) => scheduleSave({ ...form, notes })} />
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background/65 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function QuickPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function FormField({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MoneyRow({
  label,
  onHand,
  stash,
  onChange,
  keys
}: {
  label: string;
  onHand: number;
  stash: number;
  onChange: (values: Record<string, number>) => void;
  keys: [string, string];
}) {
  return (
    <div className="grid items-end gap-3 md:grid-cols-[140px_1fr_1fr]">
      <div>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <FormField label="Buret">
        <Input
          type="number"
          value={onHand}
          onChange={(event) => onChange({ [keys[0]]: Number(event.target.value) })}
        />
      </FormField>
      <FormField label="Förvar">
        <Input
          type="number"
          value={stash}
          onChange={(event) => onChange({ [keys[1]]: Number(event.target.value) })}
        />
      </FormField>
    </div>
  );
}
