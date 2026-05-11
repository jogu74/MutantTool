export default function AppIndexPage() {
  return (
    <section className="rounded-[1.75rem] border bg-card/80 p-8 shadow-panel">
      <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">App disabled</p>
      <h1 className="mt-4 font-display text-3xl">Skyddade routes återkommer i nästa steg</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Den här sidan finns bara för att vi ska kunna verifiera att `/app`-trädet inte längre försöker göra auth eller
        redirectar under Railway-debuggningen.
      </p>
    </section>
  );
}
