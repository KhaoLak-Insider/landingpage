import { CheckCircle } from "lucide-react";

export default function ConfirmPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const isSuccess = searchParams?.status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 via-white to-white px-6">

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">

        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center">
            <CheckCircle className="text-teal-600 w-7 h-7" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          {isSuccess ? "Newsletter bestätigt" : "Bestätigung fehlgeschlagen"}
        </h1>

        <p className="mt-3 text-gray-600">
          {isSuccess
            ? "Perfekt! Du bist jetzt offiziell auf unserer Liste."
            : "Der Link ist ungültig oder abgelaufen."}
        </p>

        <a
          href="/"
          className="mt-6 inline-block w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition"
        >
          Zur App
        </a>

      </div>
    </div>
  );
}