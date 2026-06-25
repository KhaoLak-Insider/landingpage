"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false); // NEU
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 12) {
      setError("Das Passwort muss mindestens 12 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    if (!acceptedTerms) {
      setError("Bitte akzeptiere unsere Datenschutzerklärung.");
      return;
    }

    setLoading(true);
    setError("");
    setUsernameError("");

    // 1. Vorab-Check Username
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (existingUser) {
      setUsernameError("Dieser Benutzername ist leider schon vergeben.");
      setLoading(false);
      return;
    }

    // 2. Registrierung
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          username, 
          full_name: name, 
          newsletter: subscribeNewsletter // Newsletter Status übertragen
        },
        emailRedirectTo: "http://localhost:3000/login",
      },
    });

    if (error) {
      setError(error.message);
    } else if (data?.user && data.user.identities?.length === 0) {
      setError("Diese E-Mail-Adresse ist bereits registriert. Bitte logge dich ein.");
    } else {
      alert("Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <form onSubmit={handleRegister} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black mb-6">Registrieren</h2>

        <input
          type="email"
          placeholder="E-Mail"
          required
          autoComplete="email"
          className="w-full h-12 mb-4 px-4 rounded-full border border-slate-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Benutzername"
          required
          autoComplete="username"
          className={`w-full h-12 mb-2 px-4 rounded-full border ${
            usernameError ? "border-red-500" : "border-slate-200"
          }`}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (usernameError) setUsernameError("");
          }}
        />
        {usernameError && (
          <p className="text-xs text-red-500 mb-4 ml-4 font-bold">
            {usernameError}
          </p>
        )}

        <input
          type="text"
          placeholder="Vorname (optional)"
          className="w-full h-12 mb-4 px-4 rounded-full border border-slate-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          placeholder="Passwort"
          required
          autoComplete="new-password"
          className="w-full h-12 mb-1 px-4 rounded-full border border-slate-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-[10px] text-slate-400 mb-3 ml-4">
          Mindestens 12 Zeichen erforderlich.
        </p>

        <input
          type="password"
          placeholder="Passwort bestätigen"
          required
          autoComplete="new-password"
          className="w-full h-12 mb-6 px-4 rounded-full border border-slate-200"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Checkboxen für Bedingungen */}
        <label className="flex items-start gap-2 mb-3 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span>
            Ich akzeptiere die{" "}
            <Link href="/datenschutz" className="text-teal-500 hover:underline">Datenschutzerklärung</Link>.
          </span>
        </label>

        <label className="flex items-center gap-2 mb-6 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
          />
          <span>Newsletter abonnieren (Reise-Updates & Insider Tipps)</span>
        </label>

        <button
          disabled={loading}
          className="w-full h-12 rounded-full bg-teal-500 font-bold text-white hover:bg-teal-400 transition"
        >
          {loading ? "Wird geprüft..." : "Konto erstellen"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Bereits einen Account?{" "}
          <Link href="/login" className="text-teal-500 font-bold hover:underline">
            Einloggen
          </Link>
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center font-bold">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}