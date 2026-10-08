"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
};

const STATUSES = ["applied", "interview", "offer", "rejected"];

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [jobText, setJobText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("applications")
      .select("id, company, role, status")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setApps(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addApp() {
    if (!company || !role) return;
    const { error } = await supabase.from("applications").insert({ company, role });
    if (error) return setError(error.message);
    setCompany("");
    setRole("");
    setError("");
    load();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("applications").update({ status }).eq("id", id);
    await supabase.from("status_history").insert({ application_id: id, status });
    load();
  }

  async function remove(id: string) {
    await supabase.from("applications").delete().eq("id", id);
    load();
  }

  async function analyze() {
    if (!jobText) return;
    setAnalyzing(true);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobText }),
    });
    const data = await res.json();
    setCompany(data.company || "");
    setRole(data.role || "");
    setAnalyzing(false);
  }

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">My Applications</h1>

      <div className="mb-6 grid grid-cols-4 gap-2">
        {STATUSES.map((s) => (
          <div key={s} className="rounded border p-3 text-center">
            <p className="text-2xl font-bold">{counts[s]}</p>
            <p className="text-sm capitalize text-gray-500">{s}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <textarea
          className="mb-2 w-full rounded border p-2"
          placeholder="Paste a job posting here..."
          rows={4}
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
        />
        <button
          className="rounded border px-4 py-2 text-sm"
          onClick={analyze}
          disabled={analyzing}
        >
          {analyzing ? "Analyzing..." : "✨ Auto-fill with AI"}
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <input
          className="flex-1 rounded border p-2"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          className="flex-1 rounded border p-2"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <button className="rounded bg-black px-4 py-2 text-white" onClick={addApp}>
          Add
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        {apps.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-semibold">{a.company}</p>
              <p className="text-sm text-gray-500">{a.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded border p-1"
                value={a.status}
                onChange={(e) => updateStatus(a.id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button className="text-sm text-red-600" onClick={() => remove(a.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
