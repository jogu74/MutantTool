"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createWeapon, deleteWeapon, updateWeapon } from "@/lib/actions/character";
import { SaveIndicator, type SaveState } from "@/components/character/save-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type WeaponRow = {
  id: string;
  name: string;
  hitChance: number;
  initiative: number;
  damage: string | null;
  penetration: number;
  range: string | null;
  rateOfFire: string | null;
  minStrength: number;
  ammoCurrent: number;
  ammoMax: number;
  weight: number;
  notes: string | null;
};

export function WeaponsSection({
  characterId,
  version,
  weapons
}: {
  characterId: string;
  version: string;
  weapons: WeaponRow[];
}) {
  const [rows, setRows] = useState(weapons);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setRows(weapons);
  }, [weapons, version]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  function updateRowLocal(nextRow: WeaponRow) {
    setRows((current) => current.map((row) => (row.id === nextRow.id ? nextRow : row)));
    setSaveState("saving");

    if (timersRef.current[nextRow.id]) {
      clearTimeout(timersRef.current[nextRow.id]);
    }

    timersRef.current[nextRow.id] = setTimeout(async () => {
      try {
        await updateWeapon(nextRow);
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 1200);
      } catch (error) {
        console.error(error);
        setSaveState("error");
        toast.error("Kunde inte spara vapnet.");
      }
    }, 650);
  }

  async function handleCreate() {
    try {
      setSaveState("saving");
      await createWeapon({ characterId });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte skapa vapnet.");
    }
  }

  async function handleDelete(id: string) {
    try {
      setRows((current) => current.filter((row) => row.id !== id));
      setSaveState("saving");
      await deleteWeapon({ id });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte ta bort vapnet.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Vapen</CardTitle>
        <SaveIndicator state={saveState} />
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead className="w-20">FV</TableHead>
              <TableHead className="w-20">Init</TableHead>
              <TableHead className="w-24">Skada</TableHead>
              <TableHead className="w-20">Pen</TableHead>
              <TableHead className="w-28">Räckvidd</TableHead>
              <TableHead className="w-24">Tål</TableHead>
              <TableHead className="w-28">Ammo</TableHead>
              <TableHead className="w-24">Vikt</TableHead>
              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input value={row.name} onChange={(event) => updateRowLocal({ ...row, name: event.target.value })} />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.hitChance}
                    onChange={(event) => updateRowLocal({ ...row, hitChance: Number(event.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.initiative}
                    onChange={(event) => updateRowLocal({ ...row, initiative: Number(event.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input value={row.damage ?? ""} onChange={(event) => updateRowLocal({ ...row, damage: event.target.value || null })} />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.penetration}
                    onChange={(event) => updateRowLocal({ ...row, penetration: Number(event.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input value={row.range ?? ""} onChange={(event) => updateRowLocal({ ...row, range: event.target.value || null })} />
                </TableCell>
                <TableCell>
                  <Input value={row.rateOfFire ?? ""} onChange={(event) => updateRowLocal({ ...row, rateOfFire: event.target.value || null })} />
                </TableCell>
                <TableCell>
                  <div className="grid grid-cols-2 gap-1">
                    <Input
                      type="number"
                      value={row.ammoCurrent}
                      onChange={(event) => updateRowLocal({ ...row, ammoCurrent: Number(event.target.value) })}
                    />
                    <Input
                      type="number"
                      value={row.ammoMax}
                      onChange={(event) => updateRowLocal({ ...row, ammoMax: Number(event.target.value) })}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    value={row.weight}
                    onChange={(event) => updateRowLocal({ ...row, weight: Number(event.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => void handleDelete(row.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => void handleCreate()}>
            <Plus className="h-4 w-4" />
            Lägg till vapen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
