import { JournalEditor } from "@/components/journal/JournalEditor";
import { JournalList } from "@/components/journal/JournalList";
import { requireUser } from "@/lib/authorization";
import { db } from "@/lib/db";
import { listJournalEntries } from "@/lib/queries";

export default async function JournalPage() {
  const user = await requireUser();

  const [entries, characters] = await Promise.all([
    listJournalEntries(),
    db.character.findMany({
      where: user.role === "ADMIN" ? undefined : { userId: user.id },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <JournalEditor characters={characters} draftOwnerId={user.id} />
      <JournalList entries={entries} currentUserId={user.id} isAdmin={user.role === "ADMIN"} />
    </div>
  );
}
