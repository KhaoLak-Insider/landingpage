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
              <strong>REISE DICH FREI WEB CONTENT PUBLISHING</strong>
              <br />
              Sole Proprietorship (Philippinisches Einzelunternehmen)
              <br />
              Inhaberin: Melody Claire Lopez Wegner
              <br />
              Purok 2, Barangay 28 - Victory Village North
              <br />
              4500 City of Legazpi, Albay
              <br />
              Philippinen
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              Kontakt
            </h2>
            <p>
              E-Mail: reisedichfrei@gmail.com
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              Register und Steuernummern
            </h2>
            <p>
              DTI-Registrierung (Department of Trade and Industry)
              <br />
              Registrierungsnummer (Certificate No.): 7027389
              <br />
              Steuernummer (Tax Identification Number - TIN): 672-251-796-00000
              <br />
              Registriert beim Bureau of Internal Revenue (BIR), Philippinen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              EU-Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a 
                href="https://ec.europa.eu/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-500 hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>.
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
            <p className="mt-3">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
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