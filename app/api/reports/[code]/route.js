import clientPromise from "@/lib/mongodb";

export async function GET(_req, { params }) {
  const { code } = await params;
  const db = (await clientPromise).db();
  const report = await db.collection("reports").findOne(
    { trackingCode: String(code).toUpperCase() },
    { projection: { _id: 0, type: 1, status: 1, statusHistory: 1, createdAt: 1 } }
  );
  if (!report) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(report);
}