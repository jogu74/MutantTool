import { NextResponse } from "next/server";

import { attachAccessCookie, ensureUserAccessToken, getPublicBaseUrl } from "@/lib/access";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", getPublicBaseUrl(request)));
  }

  const accessToken = await ensureUserAccessToken(session.user.id);
  const user = await db.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      role: true
    }
  });

  const destination = user?.role === "ADMIN" ? "/app/admin" : "/app/character";
  const response = NextResponse.redirect(new URL(destination, getPublicBaseUrl(request)));
  attachAccessCookie(response, accessToken);
  return response;
}
