import type { ReactNode } from "react";

export default async function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[1.75rem] border bg-card/80 p-5 shadow-panel">
          <div className="mb-8">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Mutant UA</p>
            <h2 className="mt-2 font-display text-2xl">Publik testshell</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Den skyddade appdelen är tillfälligt nedkopplad medan Railway-deployen isoleras.
            </p>
          </div>
        </aside>
        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
