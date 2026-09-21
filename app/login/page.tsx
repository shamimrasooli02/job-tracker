"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Check your email to confirm, then log in.");
  }

  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
else window.location.href = "/dashboard";
  }

  return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-2xl font-bold">Job Tracker</h1>
      <input
        className="mb-2 w-full rounded border p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="mb-4 w-full rounded border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="mr-2 rounded bg-black px-4 py-2 text-white" onClick={logIn}>
        Log in
      </button>
      <button className="rounded border px-4 py-2" onClick={signUp}>
        Sign up
      </button>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  );
}