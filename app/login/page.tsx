import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-primary/10 bg-card/60 p-10 shadow-panel">
          <p className="font-display text-sm uppercase tracking-[0.32em] text-primary">Mutant UA Tool</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
            Ett privat kampanjverktyg för rollformulär, journal och spelledaröverblick.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground">
            Vi har återställt själva login-ytan, men den riktiga inloggningen är fortfarande tillfälligt avstängd i
            Railway medan vi bygger tillbaka auth stegvis och säkert.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">Min karaktär</p>
              <p className="mt-2 text-sm text-muted-foreground">Snabb KP-, ammo- och utrustningshantering med autosave.</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">Journal</p>
              <p className="mt-2 text-sm text-muted-foreground">Gemensamma kampanjanteckningar i omvänd kronologisk ordning.</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-4">
              <p className="text-sm font-medium">Admin</p>
              <p className="mt-2 text-sm text-muted-foreground">Översikt över alla karaktärer och backup snapshots.</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-primary/20 bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Till startsidan
            </Link>
            <Link
              href="/probe"
              className="rounded-full border border-primary/20 bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Testa /probe
            </Link>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
