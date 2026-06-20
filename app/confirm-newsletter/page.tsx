"use client";

import { useEffect, useState } from "react";

export default function ConfirmPage() {
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    setSuccess(status === "success");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white px-6">

      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">

        <div className="text-4xl mb-4">
          {success ? "🎉" : "❌"}
        </div>

        <h1 className="text-2xl font-bold">
          {success ? "Newsletter bestätigt" : "Bestätigung fehlgeschlagen"}
        </h1>

        <p className="mt-2 text-gray-600">
          {success
            ? "Du bist jetzt erfolgreich auf der Liste."
            : "Der Link ist ungültig oder abgelaufen."}
        </p>

        <a
          href="/"
          className="mt-6 inline-block bg-teal-600 text-white px-6 py-3 rounded-xl"
        >
          Zur App
        </a>

      </div>
    </div>
  );
}