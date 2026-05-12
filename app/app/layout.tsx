import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { SidebarNav } from "@/components/app/sidebar-nav";
import { Button } from "@/components/ui/button";
import { clearAccessCookie } from "@/lib/access";
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
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="self-start rounded-[2rem] border border-border/80 bg-card/85 p-6 shadow-panel backdrop-blur lg:sticky lg:top-6">
          <div className="mb-8">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
              Mutant UA
            </div>
            <h2 className="mt-4 font-display text-2xl leading-tight">Undergångens arvtagare</h2>
            <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Aktiv åtkomst</p>
              <p className="mt-2 text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role === "ADMIN" ? "Spelledare" : "Spelare"}</p>
            </div>
          </div>
          <SidebarNav isAdmin={user.role === "ADMIN"} />
          <form action={logoutAction} className="mt-8">
            <Button type="submit" variant="outline" className="w-full justify-start">
              <LogOut className="h-4 w-4" />
              Lämna länken
            </Button>
          </form>
        </aside>
        <main className="pb-8">
          <div className="rounded-[2rem] border border-border/70 bg-card/70 p-4 shadow-panel backdrop-blur sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
