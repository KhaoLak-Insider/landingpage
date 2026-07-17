"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { getLanguageFromPathname, localizePath } from "@/src/lib/i18n-routing";
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
  const language = getLanguageFromPathname(usePathname());
  const copy = language === "en"
    ? {
        title: "Create an account",
        username: "Username",
        firstName: "First name (optional)",
        password: "Password",
        passwordHint: "At least 12 characters required.",
        confirmPassword: "Confirm password",
        privacyPrefix: "I accept the",
        privacyLink: "privacy policy",
        newsletter: "Subscribe to the newsletter (travel updates & insider tips)",
        checking: "Checking...",
        createAccount: "Create account",
        existingAccount: "Already have an account?",
        login: "Log in",
        passwordTooShort: "The password must be at least 12 characters long.",
        passwordsDoNotMatch: "The passwords do not match.",
        acceptPrivacy: "Please accept our privacy policy.",
        usernameTaken: "This username is already taken.",
        emailRegistered: "This email address is already registered. Please log in.",
        registrationSuccessful: "Registration successful! Please confirm your email address.",
        welcomeEmailError: "Error sending the welcome email:",
      }
    : {
        title: "Registrieren",
        username: "Benutzername",
        firstName: "Vorname (optional)",
        password: "Passwort",
        passwordHint: "Mindestens 12 Zeichen erforderlich.",
        confirmPassword: "Passwort bestätigen",
        privacyPrefix: "Ich akzeptiere die",
        privacyLink: "Datenschutzerklärung",
        newsletter: "Newsletter abonnieren (Reise-Updates & Insider Tipps)",
        checking: "Wird geprüft...",
        createAccount: "Konto erstellen",
        existingAccount: "Bereits einen Account?",
        login: "Einloggen",
        passwordTooShort: "Das Passwort muss mindestens 12 Zeichen lang sein.",
        passwordsDoNotMatch: "Die Passwörter stimmen nicht überein.",
        acceptPrivacy: "Bitte akzeptiere unsere Datenschutzerklärung.",
        usernameTaken: "Dieser Benutzername ist leider schon vergeben.",
        emailRegistered: "Diese E-Mail-Adresse ist bereits registriert. Bitte logge dich ein.",
        registrationSuccessful: "Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.",
        welcomeEmailError: "Fehler beim Senden der Willkommens-Mail:",
      };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 12) {
      setError(copy.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(copy.passwordsDoNotMatch);
      return;
    }

    if (!acceptedTerms) {
      setError(copy.acceptPrivacy);
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
      setUsernameError(copy.usernameTaken);
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
        emailRedirectTo: `${window.location.origin}${localizePath("/login", language)}`,
      },
    });

    if (error) {
      setError(error.message);
    } else if (data?.user && data.user.identities?.length === 0) {
      setError(copy.emailRegistered);
    } else {
      // 3. Willkommens-Mail triggern, falls Newsletter gewünscht
      if (subscribeNewsletter) {
        try {
          await fetch(`/api/send-welcome?email=${encodeURIComponent(email)}`, {
            method: "GET",
          });
        } catch (err) {
          console.error(copy.welcomeEmailError, err);
        }
      }

      alert(copy.registrationSuccessful);
      router.push(localizePath("/login", language));
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <form onSubmit={handleRegister} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black mb-6">{copy.title}</h2>

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
          placeholder={copy.username}
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
          placeholder={copy.firstName}
          className="w-full h-12 mb-4 px-4 rounded-full border border-slate-200"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          placeholder={copy.password}
          required
          autoComplete="new-password"
          className="w-full h-12 mb-1 px-4 rounded-full border border-slate-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-[10px] text-slate-400 mb-3 ml-4">
          {copy.passwordHint}
        </p>

        <input
          type="password"
          placeholder={copy.confirmPassword}
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
            {copy.privacyPrefix}{" "}
            <Link href={localizePath("/datenschutz", language)} className="text-teal-500 hover:underline">{copy.privacyLink}</Link>.
          </span>
        </label>

        <label className="flex items-center gap-2 mb-6 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={subscribeNewsletter}
            onChange={(e) => setSubscribeNewsletter(e.target.checked)}
          />
          <span>{copy.newsletter}</span>
        </label>

        <button
          disabled={loading}
          className="w-full h-12 rounded-full bg-teal-500 font-bold text-white hover:bg-teal-400 transition"
        >
          {loading ? copy.checking : copy.createAccount}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          {copy.existingAccount}{" "}
          <Link href={localizePath("/login", language)} className="text-teal-500 font-bold hover:underline">
            {copy.login}
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
