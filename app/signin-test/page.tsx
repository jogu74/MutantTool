export const dynamic = "force-dynamic";

export default function SignInTestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl rounded-[2rem] border border-primary/10 bg-card/60 p-10 shadow-panel">
        <p className="font-display text-sm uppercase tracking-[0.32em] text-primary">Sign-in probe</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Den publika testsidan renderas.</h1>
        <p className="mt-6 text-base text-muted-foreground">
          Om du ser den här sidan i Railway vet vi att redirect-loopen inte kommer från den publika routen i sig.
        </p>
      </section>
    </main>
  );
}
