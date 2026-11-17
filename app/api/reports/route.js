import clientPromise from "@/lib/mongodb";
import { REPORT_TYPES } from "@/lib/reportTypes";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";

const makeCode = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 8);
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req) {
  try {
    const form = await req.formData();

    const type = form.get("type");
    const description = String(form.get("description") || "").trim().slice(0, 1000);
    const lat = Number(form.get("lat"));
    const lng = Number(form.get("lng"));

    if (!REPORT_TYPES.includes(type)) {
      return Response.json({ error: "Invalid report type" }, { status: 400 });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return Response.json({ error: "Please drop a pin on the map" }, { status: 400 });
    }

    let photoUrl = null;
    const photo = form.get("photo");
    if (photo && typeof photo !== "string" && photo.size > 0) {
      if (!photo.type.startsWith("image/")) {
        return Response.json({ error: "Photo must be an image" }, { status: 400 });
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return Response.json({ error: "Photo is too large (max 4 MB)" }, { status: 400 });
      }
      const blob = await put(`reports/${Date.now()}.jpg`, photo, {
        access: "public",
        contentType: photo.type,
      });
      photoUrl = blob.url;
    }

    const trackingCode = makeCode();
    const now = new Date();
    const db = (await clientPromise).db();
    await db.collection("reports").insertOne({
      trackingCode,
      type,
      description,
      photoUrl,
      location: { type: "Point", coordinates: [lng, lat] },
      status: "submitted",
      statusHistory: [{ status: "submitted", changedAt: now }],
      createdAt: now,
      updatedAt: now,
    });

    return Response.json({ trackingCode });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}