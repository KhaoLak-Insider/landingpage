"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { getLanguageFromPathname, localizePath } from "@/src/lib/i18n-routing";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // Für Erfolgsmeldungen (Reset)
  const router = useRouter();
  const language = getLanguageFromPathname(usePathname());
  const copy = language === "en"
    ? {
        title: "Log in",
        password: "Password",
        loading: "Loading...",
        submit: "Log in",
        forgot: "Forgot your password?",
        noAccount: "No account yet?",
        register: "Register now",
        enterEmail: "Please enter your email address first.",
        resetSent: "Check your inbox for the reset link!",
      }
    : {
        title: "Login",
        password: "Passwort",
        loading: "Wird geladen...",
        submit: "Einloggen",
        forgot: "Passwort vergessen?",
        noAccount: "Noch kein Account?",
        register: "Jetzt registrieren",
        enterEmail: "Bitte gib zuerst deine E-Mail-Adresse ein.",
        resetSent: "Prüfe dein Postfach für den Reset-Link!",
      };

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
      router.push(localizePath("/", language));
      router.refresh(); 
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(copy.enterEmail);
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
      setMessage(copy.resetSent);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black mb-6">{copy.title}</h2>
        
        <input
          type="email"
          placeholder="E-Mail"
          className="w-full h-12 mb-4 px-4 rounded-full border border-slate-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder={copy.password}
          className="w-full h-12 mb-6 px-4 rounded-full border border-slate-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-teal-500 font-bold text-white hover:bg-teal-400 transition"
        >
          {loading ? copy.loading : copy.submit}
        </button>

        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={handleResetPassword}
            className="text-xs text-slate-500 hover:text-teal-500 transition"
          >
            {copy.forgot}
          </button>
        </div>

        {/* Neuer Link zur Registrierung */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {copy.noAccount}{" "}
          <a href={localizePath("/registrieren", language)} className="text-teal-500 font-bold hover:underline">
            {copy.register}
          </a>
        </p>

        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
        {message && <p className="mt-4 text-sm text-emerald-600 text-center">{message}</p>}
      </form>
    </div>
  );
}
