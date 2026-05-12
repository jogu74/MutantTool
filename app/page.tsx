import { redirect } from "next/navigation";

import { AccessEntry } from "@/components/auth/access-entry";
import { getCurrentUser } from "@/lib/authorization";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/app");
  }

  const params = await searchParams;
  return <AccessEntry invalidLink={params.status === "invalid-link"} />;
}
