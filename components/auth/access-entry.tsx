import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccessEntry({ invalidLink = false }: { invalidLink?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-primary/10 bg-card/60 p-10 shadow-panel">
          <p className="font-display text-sm uppercase tracking-[0.32em] text-primary">Mutant UA Tool</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
            Privat kampanjverktyg med personliga länkar i stället för login.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground">
            Varje spelare och spelledaren använder sin egen hemliga länk. När länken öppnas sparas åtkomsten säkert i
            webbläsaren och appen går direkt till rätt vy.
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
              <p className="mt-2 text-sm text-muted-foreground">Skapa spelare, dela länkar och hantera backups.</p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md border-primary/20 bg-card/95">
            <CardHeader>
              <CardTitle>Öppna med din länk</CardTitle>
              <CardDescription>
                Admin delar en personlig länk till varje spelare. Bokmärk gärna länken när du fått den.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {invalidLink ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  Länken verkar vara ogiltig eller gammal. Be admin skapa en ny åt dig.
                </div>
              ) : null}
              <div className="rounded-2xl border bg-background/70 p-4 text-sm text-muted-foreground">
                Ingen inloggning behövs längre. Om du fortfarande har en gammal testsession kan du öppna{" "}
                <Link href="/legacy-access" className="font-medium text-primary underline-offset-4 hover:underline">
                  legacy-access
                </Link>{" "}
                en sista gång för att växla över till länksystemet.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
