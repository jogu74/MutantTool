import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/authorization";
import { db } from "@/lib/db";
import { listCharactersForAdmin } from "@/lib/queries";

export default async function AdminPage() {
  await requireAdmin();

  const [characters, snapshots, players] = await Promise.all([
    listCharactersForAdmin(),
    db.backupSnapshot.findMany({
      select: {
        id: true,
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    }),
    db.user.findMany({
      where: {
        role: "PLAYER"
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: "asc"
      }
    })
  ]);

  return <AdminDashboard characters={characters} snapshots={snapshots} players={players} />;
}
