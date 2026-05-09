"use client";

import { type FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Download, KeyRound, Save, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { adminResetPlayerPassword } from "@/lib/actions/account";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBackupSnapshot, createPlayerWithCharacter, deletePlayerAccount } from "@/lib/actions/admin";
import { calculateTotalCarriedWeight } from "@/lib/rules";
import type { SerializedCharacter } from "@/lib/serializers";

type Snapshot = {
  id: string;
  createdAt: Date;
};

type Player = {
  id: string;
  email: string;
  character: {
    id: string;
    name: string;
    playerName: string;
  } | null;
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
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [latestSnapshots, setLatestSnapshots] = useState(snapshots);
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id ?? "");
  const [resetPassword, setResetPassword] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerPassword, setPlayerPassword] = useState("");

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

  function handleCreatePlayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startCreateTransition(async () => {
      try {
        const created = await createPlayerWithCharacter({
          playerName,
          characterName,
          email: playerEmail,
          password: playerPassword
        });
        setPlayerName("");
        setCharacterName("");
        setPlayerEmail("");
        setPlayerPassword("");
        toast.success("Spelare och karaktär skapades.");
        window.location.href = `/app/admin/characters/${created.id}`;
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Kunde inte skapa spelaren.");
      }
    });
  }

  function handleDeletePlayer(userId: string, label: string) {
    if (!window.confirm(`Ta bort spelaren ${label} och hela den kopplade karaktären?`)) {
      return;
    }

    startDeleteTransition(async () => {
      try {
        await deletePlayerAccount({ userId });
        toast.success("Spelaren togs bort.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Kunde inte ta bort spelaren.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lägg till spelare</CardTitle>
          <CardDescription>Skapa ett nytt spelarkonto och en tom karaktär att fylla i senare.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreatePlayer}>
            <div className="space-y-2">
              <Label htmlFor="create-player-name">Spelarnamn</Label>
              <Input
                id="create-player-name"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-character-name">Karaktär</Label>
              <Input
                id="create-character-name"
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-player-email">E-post / login</Label>
              <Input
                id="create-player-email"
                type="email"
                value={playerEmail}
                onChange={(event) => setPlayerEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-player-password">Startlösenord</Label>
              <Input
                id="create-player-password"
                type="password"
                value={playerPassword}
                onChange={(event) => setPlayerPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="md:col-span-2 xl:col-span-4">
              <Button type="submit" disabled={isCreatePending}>
                <UserPlus className="h-4 w-4" />
                {isCreatePending ? "Skapar..." : "Skapa spelare"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
                <TableHead className="w-48" />
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
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/app/admin/characters/${character.id}` as Route}>Öppna</Link>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isDeletePending}
                        onClick={() => handleDeletePlayer(character.user.id, character.playerName)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Ta bort
                      </Button>
                    </div>
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
                      {player.character?.playerName ?? player.email} ({player.email})
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
