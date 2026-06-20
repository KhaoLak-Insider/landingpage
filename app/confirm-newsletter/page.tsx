"use client";

import { useEffect, useState } from "react";

export default function ConfirmPage() {
  const [visible, setVisible] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setShowCheck(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 via-white to-white px-6">

      <div
        className={`
          w-full max-w-md text-center bg-white shadow-xl rounded-2xl p-10 border border-gray-100
          transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >

        {/* ICON */}
        <div className="flex items-center justify-center mb-6">
          <div
            className={`
              w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center
              transition-all duration-500 ease-out
              ${showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"}
            `}
          >
            <span className="text-3xl">🎉</span>
          </div>
        </div>

        {/* HEADLINE */}
        <h1 className="text-2xl font-bold text-gray-900 transition-all duration-700">
          Danke für deine Anmeldung!
        </h1>

        {/* TEXT */}
        <p className="mt-3 text-gray-600 leading-relaxed">
          Du bist jetzt erfolgreich für den{" "}
          <span className="font-medium text-gray-900">
            Khao Lak Insider Newsletter
          </span>{" "}
          eingetragen.
          <br />
          Ab sofort erhältst du exklusive Updates, neue Spots und Insider-Tipps.
        </p>

        {/* DIVIDER */}
        <div className="my-6 border-t border-gray-100" />

        {/* INFO */}
        <p className="text-sm text-gray-500">
          Willkommen an Bord 🌴
        </p>

        {/* BUTTON */}
        <a
          href="/"
          className="mt-8 inline-flex items-center justify-center w-full bg-teal-600 hover:bg-teal-700 transition-all text-white font-medium py-3 rounded-xl"
        >
          Zur App
        </a>

        {/* FOOTER */}
        <p className="mt-4 text-xs text-gray-400">
          Khao Lak Insider · Travel smarter
        </p>

      </div>
    </div>
  );
}