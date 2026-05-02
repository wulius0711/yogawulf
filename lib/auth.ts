import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE = "event_admin_token";

export interface AdminSession {
  userId: string;
  organizationId: string;
  clientSlug: string;
  email: string;
}

export async function signToken(payload: AdminSession): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function cookieName() {
  return COOKIE;
}

export function cookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}
