"use client";

import { type FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Copy, Download, RefreshCcw, Save, Trash2, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBackupSnapshot, createPlayerWithCharacter, deletePlayerAccount, rotateAccessLink } from "@/lib/actions/admin";
import { calculateTotalCarriedWeight } from "@/lib/rules";
import type { SerializedCharacter } from "@/lib/serializers";

type Snapshot = {
  id: string;
  createdAt: Date;
};

type Player = {
  id: string;
  email: string;
  accessPath: string;
  character: {
    id: string;
    name: string;
    playerName: string;
  } | null;
};

export function AdminDashboard({
  adminLink,
  characters,
  snapshots,
  players
}: {
  adminLink: {
    userId: string;
    accessPath: string;
  };
  characters: SerializedCharacter[];
  snapshots: Snapshot[];
  players: Player[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isCreatePending, startCreateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isImportPending, startImportTransition] = useTransition();
  const [isRotatePending, startRotateTransition] = useTransition();
  const [latestSnapshots, setLatestSnapshots] = useState(snapshots);
  const [linkMap, setLinkMap] = useState<Record<string, string>>({
    [adminLink.userId]: adminLink.accessPath,
    ...Object.fromEntries(players.map((player) => [player.id, player.accessPath]))
  });
  const [playerName, setPlayerName] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [backupFile, setBackupFile] = useState<File | null>(null);

  function toAbsoluteUrl(path: string) {
    if (typeof window === "undefined") {
      return path;
    }

    return new URL(path, window.location.origin).toString();
  }

  async function copyLink(path: string, successMessage = "Länken kopierades.") {
    const absoluteUrl = toAbsoluteUrl(path);

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error("Kunde inte kopiera länken automatiskt.");
    }
  }

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

  function handleImportBackup() {
    if (!backupFile) {
      toast.error("Välj en backupfil först.");
      return;
    }

    if (!window.confirm("Detta ersätter nuvarande kampanjdata med innehållet i backupen. Fortsätta?")) {
      return;
    }

    startImportTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("file", backupFile);

        const response = await fetch("/api/admin/backups/import", {
          method: "POST",
          body: formData
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error ?? "Backupen kunde inte läsas in.");
        }

        toast.success("Backupen lästes in. Laddar om adminvyn...");
        window.location.reload();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Kunde inte läsa in backupen.");
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
          email: playerEmail
        });
        setPlayerName("");
        setCharacterName("");
        setPlayerEmail("");
        await copyLink(created.accessPath, "Spelarens länk kopierades.");
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

  function handleRotateLink(userId: string) {
    startRotateTransition(async () => {
      try {
        const result = await rotateAccessLink({ userId });
        setLinkMap((current) => ({
          ...current,
          [userId]: result.accessPath
        }));
        await copyLink(result.accessPath, "Ny länk skapades och kopierades.");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Kunde inte skapa en ny länk.");
      }
    });
  }

  const totalWeight = characters
    .reduce(
      (sum, character) =>
        sum +
        calculateTotalCarriedWeight({
          equipment: character.equipmentItems,
          armor: character.armorItems,
          weapons: character.weapons
        }),
      0
    )
    .toFixed(1);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-border/70 bg-background/75 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Spelledarpanel</p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Karaktärer, länkar och säkerhetskopior på ett ställe.</h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Härifrån skapar du nya spelare, delar personliga länkar, följer kampanjens status och laddar ner eller
              återställer backups.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border bg-card/90 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Karaktärer</p>
              <p className="mt-2 text-2xl font-semibold">{characters.length}</p>
            </div>
            <div className="rounded-2xl border bg-card/90 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Spelarlänkar</p>
              <p className="mt-2 text-2xl font-semibold">{players.length + 1}</p>
            </div>
            <div className="rounded-2xl border bg-card/90 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total bärvikt</p>
              <p className="mt-2 text-2xl font-semibold">{totalWeight}</p>
            </div>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Lägg till spelare</CardTitle>
          <CardDescription>Skapa en ny spelare och kopiera direkt den personliga länken till rollformuläret.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleCreatePlayer}>
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
              <Label htmlFor="create-player-email">Kontaktadress / e-post</Label>
              <Input
                id="create-player-email"
                type="email"
                value={playerEmail}
                onChange={(event) => setPlayerEmail(event.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <Button type="submit" disabled={isCreatePending}>
                <UserPlus className="h-4 w-4" />
                {isCreatePending ? "Skapar..." : "Skapa spelare"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Åtkomstlänkar</CardTitle>
          <CardDescription>
            Alla länkar fungerar som nycklar. Den som har länken kommer in, så dela dem bara i er privata grupp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border bg-background/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium">Spelledarens länk</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">{toAbsoluteUrl(linkMap[adminLink.userId])}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => copyLink(linkMap[adminLink.userId])}>
                  <Copy className="h-4 w-4" />
                  Kopiera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isRotatePending}
                  onClick={() => handleRotateLink(adminLink.userId)}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Ny länk
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium">{player.character?.playerName ?? player.email}</p>
                    <p className="text-xs text-muted-foreground">{player.email}</p>
                    <p className="mt-2 break-all text-sm text-muted-foreground">{toAbsoluteUrl(linkMap[player.id])}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => copyLink(linkMap[player.id])}>
                      <Copy className="h-4 w-4" />
                      Kopiera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isRotatePending}
                      onClick={() => handleRotateLink(player.id)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Ny länk
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Karaktärsöversikt</CardTitle>
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
          <CardDescription>Skapa en snapshot före större ändringar och använd JSON-upload för att läsa tillbaka en backup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border bg-background/70 p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="backup-upload">Läs in backup</Label>
                <Input
                  id="backup-upload"
                  type="file"
                  accept="application/json"
                  onChange={(event) => setBackupFile(event.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">JSON-filen ersätter nuvarande kampanjdata i appen.</p>
              </div>
              <Button type="button" variant="outline" disabled={isImportPending || !backupFile} onClick={handleImportBackup}>
                <Upload className="h-4 w-4" />
                {isImportPending ? "Läser in..." : "Läs in backup"}
              </Button>
            </div>
          </div>
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
    </div>
  );
}
