"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LABEL = { submitted: "Submitted", in_progress: "In progress", fixed: "Fixed" };
const COLOR = {
  submitted: "bg-yellow-200 text-yellow-900",
  in_progress: "bg-blue-200 text-blue-900",
  fixed: "bg-green-200 text-green-900",
};

export default function Dashboard({ email }) {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/reports${filter ? `?status=${filter}` : ""}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) setError(json.error || "Failed to load");
    else setReports(json.reports);
    setLoading(false);
  }, [filter, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id, status) {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Update failed");
      return;
    }
    load();
  }

  async function logout() {
    await fetch("/api/staff/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Reports dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">{email}</span>
          <button onClick={logout} className="rounded border px-3 py-1">Log out</button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["", "submitted", "in_progress", "fixed"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`rounded border px-3 py-1 ${filter === s ? "bg-blue-600 text-white" : ""}`}
          >
            {s ? LABEL[s] : "All"}
          </button>
        ))}
        <button onClick={load} className="rounded border px-3 py-1">Refresh</button>
      </div>

      {error && <p className="mt-3 text-red-600">{error}</p>}
      {loading && <p className="mt-3">Loading...</p>}
      {!loading && reports.length === 0 && <p className="mt-3">No reports found.</p>}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Description</th>
              <th className="p-2">Photo</th>
              <th className="p-2">Location</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const [lng, lat] = r.location.coordinates;
              return (
                <tr key={r._id} className="border-b align-top">
                  <td className="p-2 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2 max-w-xs">{r.description || "-"}</td>
                  <td className="p-2">
                    {r.photoUrl ? (
                      <a href={r.photoUrl} target="_blank" rel="noreferrer" className="underline">
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Map
                    </a>
                  </td>
                  <td className="p-2">
                    <span className={`rounded px-2 py-1 ${COLOR[r.status]}`}>
                      {LABEL[r.status]}
                    </span>
                  </td>
                  <td className="p-2 space-x-2 whitespace-nowrap">
                    {r.status !== "in_progress" && r.status !== "fixed" && (
                      <button
                        onClick={() => setStatus(r._id, "in_progress")}
                        className="rounded border px-2 py-1"
                      >
                        Mark in progress
                      </button>
                    )}
                    {r.status !== "fixed" && (
                      <button
                        onClick={() => setStatus(r._id, "fixed")}
                        className="rounded border px-2 py-1"
                      >
                        Mark fixed
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}