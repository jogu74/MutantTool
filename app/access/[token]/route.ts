import { NextResponse } from "next/server";

import { attachAccessCookie, getPublicBaseUrl } from "@/lib/access";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  {
    params
  }: {
    params: Promise<{ token: string }>;
  }
) {
  const { token } = await params;

  const user = await db.user.findUnique({
    where: {
      accessToken: token
    },
    select: {
      id: true,
      role: true
    }
  });

  if (!user) {
    return NextResponse.redirect(new URL("/?status=invalid-link", getPublicBaseUrl(request)));
  }

  const destination = user.role === "ADMIN" ? "/app/admin" : "/app/character";
  const response = NextResponse.redirect(new URL(destination, getPublicBaseUrl(request)));
  attachAccessCookie(response, token);
  return response;
}
