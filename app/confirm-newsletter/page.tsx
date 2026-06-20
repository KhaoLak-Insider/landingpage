export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          🎉 Newsletter bestätigt
        </h1>

        <p className="mt-2 text-gray-600">
          Danke! Du bist jetzt erfolgreich angemeldet.
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