# Mutant UA Tool

Privat kampanjapp för `Mutant: Undergångens arvtagare`, byggd för en liten distansspelgrupp med spelare och spelledare/admin.

## Stack

- Next.js 15 med App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Auth.js med credentials-login

## Det här ingår i första inkrementet

- Inloggning med e-post/lösenord
- Server-side auth och rollkontroll för `PLAYER` och `ADMIN`
- `Min karaktär` med autosave
- Admin-dashboard med karaktärsöversikt
- Redigering av valfri karaktär som admin
- Journal med skapa/lista/ta bort
- Backup snapshots till databasen och JSON-download
- Seed-data för kampanj, admin, 4 spelare och exempelkaraktärer

## Miljövariabler

Kopiera `.env.example` till `.env` och fyll i:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mutant_ua?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
AUTH_TRUST_HOST="true"
AUTH_URL="http://localhost:3000"
```

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

5. Starta utvecklingsservern:

```bash
pnpm dev
```

## Seed-konton

- Admin: `admin@mutant.local` / `mutant123`
- Spelare: `alva@mutant.local` / `mutant123`
- Spelare: `bo@mutant.local` / `mutant123`
- Spelare: `cian@mutant.local` / `mutant123`
- Spelare: `disa@mutant.local` / `mutant123`

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

## Notering om extern disk på macOS

Projektet innehåller en liten wrapper i `scripts/run-next.mjs` som hjälper Next att använda wasm-SWC när native SWC-binären inte går att ladda från en extern volym. Det minskar vanliga macOS-problem när projekt ligger under `/Volumes/...`.

## Nästa steg

- Förbättra live sync med tydligare polling/status per vy
- Lägg till inline-redigering av journalposter
- Förfina adminöversikten med filter och snabbare statushantering
- Verifiera och justera reglerna i `lib/rules.ts` mot exakt Mutant UA-regeltext
