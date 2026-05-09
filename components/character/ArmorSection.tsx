"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createArmorItem, deleteArmorItem, updateArmorItem } from "@/lib/actions/character";
import { calculateArmorWeight } from "@/lib/rules";
import { SaveIndicator, type SaveState } from "@/components/character/save-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ArmorRow = {
  id: string;
  name: string;
  armorValue: number;
  protection: string | null;
  weight: number;
  location: string | null;
};

export function ArmorSection({
  characterId,
  version,
  items
}: {
  characterId: string;
  version: string;
  items: ArmorRow[];
}) {
  const [rows, setRows] = useState(items);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setRows(items);
  }, [items, version]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const totalWeight = useMemo(() => calculateArmorWeight(rows), [rows]);

  function updateRowLocal(nextRow: ArmorRow) {
    setRows((current) => current.map((row) => (row.id === nextRow.id ? nextRow : row)));
    setSaveState("saving");

    if (timersRef.current[nextRow.id]) {
      clearTimeout(timersRef.current[nextRow.id]);
    }

    timersRef.current[nextRow.id] = setTimeout(async () => {
      try {
        await updateArmorItem(nextRow);
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 1200);
      } catch (error) {
        console.error(error);
        setSaveState("error");
        toast.error("Kunde inte spara rustningen.");
      }
    }, 650);
  }

  async function handleCreate() {
    try {
      setSaveState("saving");
      await createArmorItem({ characterId });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte skapa rustningen.");
    }
  }

  async function handleDelete(id: string) {
    try {
      setRows((current) => current.filter((row) => row.id !== id));
      setSaveState("saving");
      await deleteArmorItem({ id });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1200);
    } catch (error) {
      console.error(error);
      setSaveState("error");
      toast.error("Kunde inte ta bort rustningen.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Rustning</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Total vikt: {totalWeight.toFixed(1)}</p>
        </div>
        <SaveIndicator state={saveState} />
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plagg</TableHead>
              <TableHead className="w-24">ABS</TableHead>
              <TableHead className="w-24">Skydd</TableHead>
              <TableHead className="w-24">Vikt</TableHead>
              <TableHead className="w-40">Plats</TableHead>
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
                    value={row.armorValue}
                    onChange={(event) => updateRowLocal({ ...row, armorValue: Number(event.target.value) })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.protection ?? ""}
                    onChange={(event) => updateRowLocal({ ...row, protection: event.target.value || null })}
                  />
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
                  <Input value={row.location ?? ""} onChange={(event) => updateRowLocal({ ...row, location: event.target.value || null })} />
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
            Lägg till rustning
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
