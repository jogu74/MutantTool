"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createSkill, deleteSkill, updateSkill } from "@/lib/actions/character";
import { SaveIndicator, type SaveState } from "@/components/character/save-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type SkillTypeValue = "NATURAL" | "TRAINED";

type SkillRow = {
  id: string;
  name: string;
  type: SkillTypeValue;
  skillValue: number;
  modifier: number;
  finalValue: number;
};

export function SkillsSection({
  characterId,
  version,
  skills
}: {
  characterId: string;
  version: string;
  skills: SkillRow[];
}) {
  const [rows, setRows] = useState(skills);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setRows(skills);
  }, [skills, version]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const naturalSkills = useMemo(() => rows.filter((skill) => skill.type === "NATURAL"), [rows]);
  const trainedSkills = useMemo(() => rows.filter((skill) => skill.type === "TRAINED"), [rows]);

  function updateRowLocal(nextRow: SkillRow) {
    setRows((current) => current.map((row) => (row.id === nextRow.id ? nextRow : row)));
    setSaveState("saving");

    if (timersRef.current[nextRow.id]) {
      clearTimeout(timersRef.current[nextRow.id]);
    }

    timersRef.current[nextRow.id] = setTimeout(async () => {
      try {
        await updateSkill(nextRow);
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 1200);
      } catch (error) {
        console.error(error);
        setSaveState("error");
        toast.error("Kunde inte spara färdigheten.");
      }
    }, 650);
  }

  async function handleCreate(type: SkillTypeValue) {
    try {
      setSaveState("saving");
      await createSkill({
        characterId,
        type,
        name: type === "NATURAL" ? "Ny naturlig färdighet" : "Ny tränad färdighet"
      });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte skapa färdigheten.");
    }
  }

  async function handleDelete(id: string) {
    try {
      setRows((current) => current.filter((row) => row.id !== id));
      setSaveState("saving");
      await deleteSkill({ id });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte ta bort färdigheten.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Färdigheter</CardTitle>
        <SaveIndicator state={saveState} />
      </CardHeader>
      <CardContent className="space-y-6">
        <SkillsTable title="Naturliga färdigheter" rows={naturalSkills} onChange={updateRowLocal} onDelete={handleDelete} />
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => void handleCreate("NATURAL")}>
            <Plus className="h-4 w-4" />
            Lägg till naturlig
          </Button>
        </div>
        <SkillsTable title="Tränade färdigheter" rows={trainedSkills} onChange={updateRowLocal} onDelete={handleDelete} />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => void handleCreate("TRAINED")}>
            <Plus className="h-4 w-4" />
            Lägg till tränad
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillsTable({
  title,
  rows,
  onChange,
  onDelete
}: {
  title: string;
  rows: SkillRow[];
  onChange: (row: SkillRow) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">FV + mod = slutvärde</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Namn</TableHead>
            <TableHead className="w-20">FV</TableHead>
            <TableHead className="w-20">Mod</TableHead>
            <TableHead className="w-24">Slut</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Input value={row.name} onChange={(event) => onChange({ ...row, name: event.target.value })} />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={row.skillValue}
                  onChange={(event) =>
                    onChange({
                      ...row,
                      skillValue: Number(event.target.value),
                      finalValue: Number(event.target.value) + row.modifier
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={row.modifier}
                  onChange={(event) =>
                    onChange({
                      ...row,
                      modifier: Number(event.target.value),
                      finalValue: row.skillValue + Number(event.target.value)
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <Input value={row.finalValue} readOnly className="bg-muted" />
              </TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => void onDelete(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
