import { NextResponse } from "next/server";

import { attachAccessCookie } from "@/lib/access";
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
      id: true
    }
  });

  if (!user) {
    return NextResponse.redirect(new URL("/?status=invalid-link", request.url));
  }

  const response = NextResponse.redirect(new URL("/app", request.url));
  attachAccessCookie(response, token);
  return response;
}
