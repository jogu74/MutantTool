"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteJournalEntry } from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JournalEntryItem = {
  id: string;
  title: string | null;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
  };
  character: {
    id: string;
    name: string;
  } | null;
};

export function JournalList({
  entries,
  currentUserId,
  isAdmin
}: {
  entries: JournalEntryItem[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteJournalEntry({ id });
        toast.success("Journalinlägget togs bort.");
      } catch (error) {
        console.error(error);
        toast.error("Kunde inte ta bort journalinlägget.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Inga journalinlägg ännu.</CardContent>
        </Card>
      ) : (
        entries.map((entry) => {
          const canDelete = isAdmin || entry.author.id === currentUserId;

          return (
            <Card key={entry.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{entry.title || "Utan titel"}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.author.name} · {new Date(entry.createdAt).toLocaleString("sv-SE")}
                    {entry.character ? ` · ${entry.character.name}` : ""}
                  </p>
                </div>
                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-7">{entry.content}</div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
