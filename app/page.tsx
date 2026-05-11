import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-4xl rounded-[2rem] border border-primary/10 bg-card/60 p-10 shadow-panel">
        <p className="font-display text-sm uppercase tracking-[0.32em] text-primary">Mutant UA Tool</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
          Railway-probe: minimal publik startsida
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground">
          Den här versionen är medvetet nedbantad för att verifiera att själva Next.js-deployen fungerar utan
          auth-flöden, redirectkedjor eller databasberoenden.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/probe"
            className="rounded-full border border-primary/20 bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Öppna /probe
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-primary/20 bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Öppna /login
          </Link>
        </div>
      </section>
    </main>
  );
}
