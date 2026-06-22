"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // Für Erfolgsmeldungen (Reset)
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh(); 
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Bitte gib zuerst deine E-Mail-Adresse ein.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password",
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Prüfe dein Postfach für den Reset-Link!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black mb-6">Login</h2>
        
        <input
          type="email"
          placeholder="E-Mail"
          className="w-full h-12 mb-4 px-4 rounded-full border border-slate-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          className="w-full h-12 mb-6 px-4 rounded-full border border-slate-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-teal-500 font-bold text-white hover:bg-teal-400 transition"
        >
          {loading ? "Wird geladen..." : "Einloggen"}
        </button>

        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={handleResetPassword}
            className="text-xs text-slate-500 hover:text-teal-500 transition"
          >
            Passwort vergessen?
          </button>
        </div>

        {/* Neuer Link zur Registrierung */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Noch kein Account?{" "}
          <a href="/registrieren" className="text-teal-500 font-bold hover:underline">
            Jetzt registrieren
          </a>
        </p>

        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-600 text-center">{message}</p>}
      </form>
    </div>
  );
}