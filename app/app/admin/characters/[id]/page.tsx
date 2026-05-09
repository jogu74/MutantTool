import { CharacterSheet } from "@/components/character/CharacterSheet";
import { getCharacterForAdmin } from "@/lib/queries";

export default async function AdminCharacterPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getCharacterForAdmin(id);

  return <CharacterSheet character={character} mode="admin" />;
}
