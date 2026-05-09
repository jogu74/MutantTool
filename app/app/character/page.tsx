import { redirect } from "next/navigation";

import { CharacterSheet } from "@/components/character/CharacterSheet";
import { requireUser } from "@/lib/authorization";
import { getMyCharacter } from "@/lib/queries";

export default async function CharacterPage() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    redirect("/app/admin");
  }

  const character = await getMyCharacter();

  return <CharacterSheet character={character} mode="player" />;
}
