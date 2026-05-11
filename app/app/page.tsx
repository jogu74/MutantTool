import { redirect } from "next/navigation";

import { requireUser } from "@/lib/authorization";

export default async function AppIndexPage() {
  const user = await requireUser();

  redirect(user.role === "ADMIN" ? "/app/admin" : "/app/character");
}
