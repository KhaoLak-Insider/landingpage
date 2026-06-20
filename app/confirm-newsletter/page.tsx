export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 via-white to-white px-6">
      
      <div className="w-full max-w-md text-center bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
        
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-teal-50 mb-6">
          <span className="text-3xl">🎉</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-bold text-gray-900">
          Danke für deine Anmeldung!
        </h1>

        {/* Subtext */}
        <p className="mt-3 text-gray-600 leading-relaxed">
          Du bist jetzt erfolgreich für den <span className="font-medium text-gray-900">Khao Lak Insider Newsletter</span> eingetragen.
          <br />
          Ab sofort erhältst du exklusive Updates, neue Spots und Insider-Tipps direkt in dein Postfach.
        </p>

        {/* Divider */}
        <div className="my-6 border-t border-gray-100" />

        {/* Info small */}
        <p className="text-sm text-gray-500">
          Wir halten dich nur mit wirklich relevanten Reise-Updates auf dem Laufenden.
        </p>

        {/* Button */}
        <a
          href="/"
          className="mt-8 inline-flex items-center justify-center w-full bg-teal-600 hover:bg-teal-700 transition-colors text-white font-medium py-3 rounded-xl"
        >
          Zurück zur Homepage
        </a>

        {/* Footer */}
        <p className="mt-4 text-xs text-gray-400">
          Khao Lak Insider · Travel smarter
        </p>

      </div>
    </div>
  );
}