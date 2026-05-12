import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import { SidebarNav } from "@/components/app/sidebar-nav";
import { Button } from "@/components/ui/button";
import { clearAccessCookie } from "@/lib/access";
import { signOut } from "@/lib/auth";
import { requireUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireUser();

  async function logoutAction() {
    "use server";

    await clearAccessCookie();
    await signOut({
      redirectTo: "/"
    });
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[1.75rem] border bg-card/80 p-5 shadow-panel">
          <div className="mb-8">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Mutant UA</p>
            <h2 className="mt-2 font-display text-2xl">Undergångens arvtagare</h2>
            <p className="mt-3 text-sm text-muted-foreground">{user.name}</p>
          </div>
          <SidebarNav isAdmin={user.role === "ADMIN"} />
          <form action={logoutAction} className="mt-8">
            <Button type="submit" variant="outline" className="w-full justify-start">
              <LogOut className="h-4 w-4" />
              Lämna länken
            </Button>
          </form>
        </aside>
        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
