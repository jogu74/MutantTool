"use client";

import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateMyAccountProfile, updateMyPassword } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AccountSettingsProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "PLAYER" | "ADMIN";
  };
};

export function AccountSettings({ user }: AccountSettingsProps) {
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startProfileTransition(async () => {
      try {
        await updateMyAccountProfile({ name, email });
        toast.success("Kontouppgifterna sparades.");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Kunde inte spara kontouppgifterna.");
      }
    });
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startPasswordTransition(async () => {
      try {
        await updateMyPassword({
          currentPassword,
          newPassword,
          confirmPassword
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Lösenordet uppdaterades.");
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Kunde inte uppdatera lösenordet.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
          <CardDescription>Ändra namn och e-postadressen som används vid inloggning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account-name">Namn</Label>
                <Input
                  id="account-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-email">E-post / login</Label>
                <Input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="rounded-xl border bg-background/60 p-4">
              <p className="text-sm font-medium">Roll</p>
              <p className="mt-1 text-sm text-muted-foreground">{user.role === "ADMIN" ? "ADMIN / GM" : "PLAYER"}</p>
            </div>
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Sparar..." : "Spara kontouppgifter"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Byt lösenord</CardTitle>
          <CardDescription>Ange nuvarande lösenord och välj ett nytt med minst åtta tecken.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <Label htmlFor="current-password">Nuvarande lösenord</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nytt lösenord</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Bekräfta nytt lösenord</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={passwordPending}>
              {passwordPending ? "Uppdaterar..." : "Byt lösenord"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
