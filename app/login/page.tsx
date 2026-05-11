import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-3xl rounded-[2rem] border border-primary/10 bg-card/60 p-10 shadow-panel">
        <p className="font-display text-sm uppercase tracking-[0.32em] text-primary">Login placeholder</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Publik testsida utan auth</h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground">
          Inloggningen är tillfälligt bortkopplad i Railway-versionen medan vi verifierar en minimal fungerande grund.
          När den här sidan laddar korrekt vet vi att deploykedjan är stabil och kan börja bygga tillbaka auth stegvis.
        </p>
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
    </main>
  );
}
