export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white px-8 py-20">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black text-slate-900">
          Impressum
        </h1>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="mb-3 text-xl font-bold">
              Angaben gemäß § 5 DDG
            </h2>

            <p>
              Martin Gilde
              <br />
              Horather Straße 159
              <br />
              42111 Wuppertal
              <br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              Kontakt
            </h2>

            <p>
              E-Mail: admin@khaolak.app
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>

            <p>
              Martin Gilde
              <br />
              Horather Straße 159
              <br />
              42111 Wuppertal
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              Haftung für Inhalte
            </h2>

            <p>
              Als Diensteanbieter sind wir gemäß den allgemeinen Gesetzen
              für eigene Inhalte auf diesen Seiten verantwortlich. Wir sind
              jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu
              forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              Haftung für Links
            </h2>

            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              Urheberrecht
            </h2>

            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht.
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}