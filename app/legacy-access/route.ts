import { NextResponse } from "next/server";

import { attachAccessCookie, ensureUserAccessToken } from "@/lib/access";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const accessToken = await ensureUserAccessToken(session.user.id);
  const response = NextResponse.redirect(new URL("/app", request.url));
  attachAccessCookie(response, accessToken);
  return response;
}
