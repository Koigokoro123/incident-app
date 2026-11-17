import clientPromise from "@/lib/mongodb";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password } = await req.json();
  const db = (await clientPromise).db();
  const staff = await db
    .collection("staff")
    .findOne({ email: String(email || "").toLowerCase().trim() });
  const ok = staff && (await bcrypt.compare(String(password || ""), staff.passwordHash));
  if (!ok) {
    return Response.json({ error: "Wrong email or password" }, { status: 401 });
  }
  await createSession(staff);
  return Response.json({ ok: true });
}