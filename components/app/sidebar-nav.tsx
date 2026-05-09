"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BookText, Settings, Shield, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items: Array<{
  href: Route;
  label: string;
  icon: typeof User;
  adminOnly: boolean;
  playerOnly?: boolean;
}> = [
  {
    href: "/app/character",
    label: "Min karaktär",
    icon: User,
    adminOnly: false,
    playerOnly: true
  },
  {
    href: "/app/journal",
    label: "Journal",
    icon: BookText,
    adminOnly: false
  },
  {
    href: "/app/account",
    label: "Konto",
    icon: Settings,
    adminOnly: false
  },
  {
    href: "/app/admin",
    label: "Admin",
    icon: Shield,
    adminOnly: true
  }
];

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items
        .filter((item) => (!item.adminOnly || isAdmin) && (!item.playerOnly || !isAdmin))
        .map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                active ? "border-primary bg-primary/10 text-primary" : "bg-card/70 hover:bg-card"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.adminOnly ? <Badge variant="outline">GM</Badge> : null}
            </Link>
          );
        })}
    </nav>
  );
}
