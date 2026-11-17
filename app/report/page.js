"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { REPORT_TYPES } from "@/lib/reportTypes";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function ReportPage() {
  const [position, setPosition] = useState(null);
  const [type, setType] = useState(REPORT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Could not get your location. Tap the map instead.")
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!position) {
      setError("Please drop a pin on the map first");
      return;
    }
    const data = new FormData();
    data.append("type", type);
    data.append("description", description);
    data.append("lat", position.lat);
    data.append("lng", position.lng);
    if (photo) data.append("photo", photo);

    setLoading(true);
    try {
      const res = await fetch("/api/reports", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");
      setCode(json.trackingCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (code) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold">Report submitted</h1>
        <p className="mt-4">Save this tracking code. It is the only way to check your report later:</p>
        <p className="mt-2 rounded bg-gray-100 p-4 text-center text-3xl font-mono tracking-widest text-black">
          {code}
        </p>
        <button className="mt-6 underline" onClick={() => window.location.reload()}>
          Submit another report
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Report a problem</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <p className="mb-1 font-medium">1. Tap the map to mark the location</p>
          <button type="button" onClick={useMyLocation} className="mb-2 rounded border px-3 py-1">
            Use my location
          </button>
          <MapPicker position={position} onPick={setPosition} />
        </div>

        <div>
          <label className="mb-1 block font-medium">2. Type of problem</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border p-2 text-black"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">3. Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full rounded border p-2 text-black"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">4. Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files[0] || null)}
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit report"}
        </button>
      </form>
    </main>
  );
}