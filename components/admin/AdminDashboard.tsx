"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Download, KeyRound, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { adminResetPlayerPassword } from "@/lib/actions/account";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBackupSnapshot } from "@/lib/actions/admin";
import { calculateTotalCarriedWeight } from "@/lib/rules";
import type { SerializedCharacter } from "@/lib/serializers";

type Snapshot = {
  id: string;
  createdAt: Date;
};

type Player = {
  id: string;
  name: string;
  email: string;
};

export function AdminDashboard({
  characters,
  snapshots,
  players
}: {
  characters: SerializedCharacter[];
  snapshots: Snapshot[];
  players: Player[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isResetPending, startResetTransition] = useTransition();
  const [latestSnapshots, setLatestSnapshots] = useState(snapshots);
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id ?? "");
  const [resetPassword, setResetPassword] = useState("");

  function handleCreateBackup() {
    startTransition(async () => {
      try {
        const snapshot = await createBackupSnapshot();
        setLatestSnapshots((current) => [snapshot, ...current]);
        toast.success("Backup snapshot skapad.");
      } catch (error) {
        console.error(error);
        toast.error("Kunde inte skapa backup.");
      }
    });
  }

  function handleResetPassword() {
    startResetTransition(async () => {
      try {
        await adminResetPlayerPassword({
          userId: selectedPlayerId,
          newPassword: resetPassword
        });
        setResetPassword("");
        toast.success("Spelarens lösenord uppdaterades.");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Kunde inte uppdatera spelarens lösenord.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Admin-dashboard</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Översikt över alla karaktärer och snabba länkar till hela rollformuläret.
            </p>
          </div>
          <Button onClick={handleCreateBackup} disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Skapar backup..." : "Skapa backup"}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Karaktär</TableHead>
                <TableHead>Spelare</TableHead>
                <TableHead>KP</TableHead>
                <TableHead>TT</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bärvikt</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {characters.map((character) => (
                <TableRow key={character.id}>
                  <TableCell className="font-medium">{character.name}</TableCell>
                  <TableCell>{character.playerName}</TableCell>
                  <TableCell>{character.bodyPoints}</TableCell>
                  <TableCell>{character.traumaThreshold}</TableCell>
                  <TableCell>{character.status || "Ingen"}</TableCell>
                  <TableCell>
                    {calculateTotalCarriedWeight({
                      equipment: character.equipmentItems,
                      armor: character.armorItems,
                      weapons: character.weapons
                    }).toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/app/admin/characters/${character.id}` as Route}>Öppna</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestSnapshots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga snapshots ännu.</p>
            ) : (
              latestSnapshots.map((snapshot) => (
                <div key={snapshot.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="text-sm font-medium">{snapshot.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(snapshot.createdAt).toLocaleString("sv-SE")}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={`/api/admin/backups/${snapshot.id}`} download>
                      <Download className="h-4 w-4" />
                      Ladda ner JSON
                    </a>
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lösenordsreset för spelare</CardTitle>
          <CardDescription>Sätt ett nytt lösenord för en spelare om någon tappat bort sitt gamla.</CardDescription>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">Det finns inga spelarkonton att återställa ännu.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="reset-player">Spelare</Label>
                <Select
                  id="reset-player"
                  value={selectedPlayerId}
                  onChange={(event) => setSelectedPlayerId(event.target.value)}
                >
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.email})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-password">Nytt lösenord</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  minLength={8}
                  placeholder="Minst 8 tecken"
                />
              </div>
              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={isResetPending || !selectedPlayerId || resetPassword.length < 8}
              >
                <KeyRound className="h-4 w-4" />
                {isResetPending ? "Uppdaterar..." : "Sätt nytt lösenord"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
