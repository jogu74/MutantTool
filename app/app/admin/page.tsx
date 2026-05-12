import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { buildAccessPath, ensureUserAccessToken } from "@/lib/access";
import { requireAdmin } from "@/lib/authorization";
import { db } from "@/lib/db";
import { listCharactersForAdmin } from "@/lib/queries";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const adminAccessToken = await ensureUserAccessToken(admin.id);

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
        email: true,
        accessToken: true,
        character: {
          select: {
            id: true,
            name: true,
            playerName: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    })
  ]);

  const playersWithLinks = await Promise.all(
    players.map(async (player) => {
      const accessToken = player.accessToken ?? (await ensureUserAccessToken(player.id));

      return {
        ...player,
        accessPath: buildAccessPath(accessToken)
      };
    })
  );

  return (
    <AdminDashboard
      adminLink={{
        userId: admin.id,
        accessPath: buildAccessPath(adminAccessToken)
      }}
      characters={characters}
      snapshots={snapshots}
      players={playersWithLinks}
    />
  );
}
