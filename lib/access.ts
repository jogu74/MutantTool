import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildAccessPath, createAccessToken } from "@/lib/access-token";
import { db } from "@/lib/db";

export { buildAccessPath, createAccessToken } from "@/lib/access-token";

export const ACCESS_COOKIE_NAME = "mutant_access_token";
export const LINK_ONLY_PASSWORD_HASH = "link-only-account";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 180
};

export async function getAccessCookieToken() {
  const store = await cookies();
  return store.get(ACCESS_COOKIE_NAME)?.value ?? null;
}

export async function setAccessCookie(token: string) {
  const store = await cookies();
  store.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    ...cookieOptions
  });
}

export async function clearAccessCookie() {
  const store = await cookies();
  store.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    ...cookieOptions,
    maxAge: 0
  });
}

export function attachAccessCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    ...cookieOptions
  });
}

export async function ensureUserAccessToken(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId
    },
    select: {
      accessToken: true
    }
  });

  if (!user) {
    throw new Error("Kontot kunde inte hittas.");
  }

  if (user.accessToken) {
    return user.accessToken;
  }

  return rotateUserAccessToken(userId);
}

export async function rotateUserAccessToken(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true
    }
  });

  if (!user) {
    throw new Error("Kontot kunde inte hittas.");
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const accessToken = createAccessToken();
    const existing = await db.user.findUnique({
      where: {
        accessToken
      },
      select: {
        id: true
      }
    });

    if (existing) {
      continue;
    }

    await db.user.update({
      where: {
        id: userId
      },
      data: {
        accessToken
      }
    });

    return accessToken;
  }

  throw new Error("Kunde inte skapa en unik åtkomstlänk. Försök igen.");
}
