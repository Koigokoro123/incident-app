import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "staff_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function createSession(staff) {
  const token = await new SignJWT({ email: staff.email, types: staff.types })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}