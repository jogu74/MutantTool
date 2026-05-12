import { randomBytes } from "node:crypto";

export function createAccessToken() {
  return randomBytes(24).toString("base64url");
}

export function buildAccessPath(token: string) {
  return `/access/${token}`;
}
