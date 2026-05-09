"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { createJournalEntry } from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type JournalDraft = {
  title: string;
  content: string;
  characterId: string;
  updatedAt: number;
};

export function JournalEditor({
  characters,
  draftOwnerId
}: {
  characters: Array<{ id: string; name: string }>;
  draftOwnerId: string;
}) {
  const storageKey = `mutant-ua:journal-draft:${draftOwnerId}`;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasDraft = Boolean(title.trim() || content.trim() || characterId);

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(storageKey);

      if (!rawDraft) {
        return;
      }

      const parsed = JSON.parse(rawDraft) as Partial<JournalDraft>;

      if (typeof parsed.title === "string") {
        setTitle(parsed.title);
      }

      if (typeof parsed.content === "string") {
        setContent(parsed.content);
      }

      if (typeof parsed.characterId === "string") {
        setCharacterId(parsed.characterId);
      }

      if (typeof parsed.updatedAt === "number") {
        setLastSavedAt(parsed.updatedAt);
      }
    } catch (error) {
      console.error(error);
      window.localStorage.removeItem(storageKey);
    } finally {
      setHasLoadedDraft(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedDraft) {
      return;
    }

    if (!hasDraft) {
      window.localStorage.removeItem(storageKey);
      setLastSavedAt(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const updatedAt = Date.now();
      const draft: JournalDraft = {
        title,
        content,
        characterId,
        updatedAt
      };

      window.localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastSavedAt(updatedAt);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [characterId, content, hasDraft, hasLoadedDraft, storageKey, title]);

  function clearDraft(options?: { silent?: boolean }) {
    setTitle("");
    setContent("");
    setCharacterId("");
    setLastSavedAt(null);
    window.localStorage.removeItem(storageKey);

    if (!options?.silent) {
      toast.success("Utkastet rensades.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await createJournalEntry({
          title: title || null,
          content,
          characterId: characterId || null
        });
        clearDraft({ silent: true });
        toast.success("Journalinlägget sparades.");
      } catch (error) {
        console.error(error);
        toast.error("Kunde inte spara journalinlägget.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nytt journalinlägg</CardTitle>
        <CardDescription>
          Utkast sparas automatiskt i den här webbläsaren tills du publicerar eller rensar det.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <Label htmlFor="journal-title">Titel</Label>
              <Input
                id="journal-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Valfri titel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journal-character">Kopplad karaktär</Label>
              <Select id="journal-character" value={characterId} onChange={(event) => setCharacterId(event.target.value)}>
                <option value="">Ingen koppling</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="journal-content">Innehåll</Label>
            <Textarea
              id="journal-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              placeholder="Skriv vad som hände under spelmötet..."
              required
            />
          </div>
          <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              {!hasLoadedDraft
                ? "Laddar utkast..."
                : hasDraft && lastSavedAt
                  ? `Utkast sparat lokalt ${new Date(lastSavedAt).toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}`
                  : "Inget osparat utkast."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => clearDraft()}
                disabled={isPending || !hasDraft}
              >
                Rensa utkast
              </Button>
              <Button type="submit" disabled={isPending || !content.trim()}>
                {isPending ? "Sparar..." : "Spara journalinlägg"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
