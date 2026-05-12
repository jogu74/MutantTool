# Mutant UA Tool

Privat kampanjapp för `Mutant: Undergångens arvtagare`, byggd för en liten distansspelgrupp med spelare och spelledare/admin.

## Stack

- Next.js 15 med App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Hemliga personliga länkar per spelare och admin

## Det här ingår i första inkrementet

- Åtkomst via hemliga länkar och server-side access control
- `Min karaktär` med autosave
- Admin-dashboard med karaktärsöversikt
- Redigering av valfri karaktär som admin
- Journal med skapa/lista/ta bort
- Backup snapshots till databasen, JSON-download och JSON-import
- Seed-data för kampanj, admin, 4 spelare och exempelkaraktärer med färdiga åtkomstlänkar

## Miljövariabler

Kopiera `.env.example` till `.env` och fyll i:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mutant_ua?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
AUTH_TRUST_HOST="true"
AUTH_URL="http://localhost:3000"
```

`AUTH_*` används bara för den tillfälliga bryggan `/legacy-access` om ni vill växla över från gamla testkonton till länksystemet utan att låsa ute någon.

## Lokal körning

1. Installera beroenden:

```bash
pnpm install
```

`pnpm install` kör också `prisma generate` automatiskt via `postinstall`.

2. Generera Prisma-klienten manuellt vid behov:

```bash
pnpm exec prisma generate
```

3. Kör migrering mot din lokala PostgreSQL:

```bash
pnpm exec prisma migrate dev --name init
```

4. Seeda databasen:

```bash
pnpm exec prisma db seed
```

Seed-scriptet skriver ut adminlänken i terminalen som `/access/<token>`.

5. Starta utvecklingsservern:

```bash
pnpm dev
```

## Seed-data

- Adminen och varje exempelspelare får en egen personlig åtkomstlänk.
- Adminlänken skrivs ut när seed körs.
- Spelarlänkarna kan kopieras från adminpanelen under `Åtkomstlänkar`.

## Railway

1. Skapa ett nytt Railway-projekt.
2. Lägg till en PostgreSQL-databas.
3. Sätt miljövariablerna ovan i Railway.
4. Använd följande kommandon:

```bash
Build command: pnpm build
Start command: pnpm start
```

5. Kör migrering efter första deployen:

```bash
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
```

Efter seed:

- öppna adminlänken som skrivs ut i loggarna
- kopiera spelarlänkar från adminpanelen
- använd `Backup snapshots` för JSON-download och `Läs in backup` för att återställa en uppladdad backup

## Notering om extern disk på macOS

Projektet innehåller en liten wrapper i `scripts/run-next.mjs` som hjälper Next att använda wasm-SWC när native SWC-binären inte går att ladda från en extern volym. Det minskar vanliga macOS-problem när projekt ligger under `/Volumes/...`.

## Nästa steg

- Förbättra live sync med tydligare polling/status per vy
- Lägg till inline-redigering av journalposter
- Förfina adminöversikten med filter och snabbare statushantering
- Verifiera och justera reglerna i `lib/rules.ts` mot exakt Mutant UA-regeltext
