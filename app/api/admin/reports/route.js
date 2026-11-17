import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { STATUSES } from "@/lib/reportTypes";

export async function GET(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const filter = session.types.includes("all") ? {} : { type: { $in: session.types } };
  const status = new URL(req.url).searchParams.get("status");
  if (STATUSES.includes(status)) filter.status = status;

  const db = (await clientPromise).db();
  const reports = await db
    .collection("reports")
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return Response.json({
    reports: reports.map((r) => ({ ...r, _id: r._id.toString() })),
  });
}