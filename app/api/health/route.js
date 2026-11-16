import clientPromise from "@/lib/mongodb";

export async function GET() {
  const db = (await clientPromise).db();
  await db.command({ ping: 1 });
  return Response.json({ ok: true });
}