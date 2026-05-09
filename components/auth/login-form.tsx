"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("admin@mutant.local");
  const [password, setPassword] = useState("mutant123");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        toast.error("Inloggningen misslyckades.");
        return;
      }

      router.push("/app");
      router.refresh();
    });
  }

  if (!isMounted) {
    return (
      <Card className="w-full max-w-md border-primary/20 bg-card/95">
        <CardHeader>
          <CardTitle>Logga in</CardTitle>
          <CardDescription>Laddar in formuläret...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-10 animate-pulse rounded-xl bg-muted/60" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-primary/20 bg-card/95">
      <CardHeader>
        <CardTitle>Logga in</CardTitle>
        <CardDescription>
          Exempelanvändare efter seed: <code>admin@mutant.local</code> och lösenordet <code>mutant123</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Loggar in..." : "Fortsätt till kampanjen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
