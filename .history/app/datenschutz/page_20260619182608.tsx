export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-white px-8 py-20 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black">Datenschutzerklärung</h1>

        <div className="mt-10 space-y-8 text-slate-700">
          <section>
            <h2 className="mb-3 text-xl font-bold">1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              <br />
              <br />
              Martin Gilde
              <br />
              Horather Straße 159
              <br />
              42111 Wuppertal
              <br />
              Deutschland
              <br />
              <br />
              E-Mail: admin@khaolak.app
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">2. Allgemeine Hinweise</h2>
            <p>
              Wir nehmen den Schutz personenbezogener Daten sehr ernst.
              Personenbezogene Daten werden nur verarbeitet, soweit dies zur
              Bereitstellung dieser Website, zur Bearbeitung von Anfragen oder
              zum Betrieb der Warteliste erforderlich ist.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              3. Zugriffsdaten und Hosting
            </h2>
            <p>
              Diese Website wird voraussichtlich bei Vercel gehostet. Beim
              Aufruf der Website können technisch notwendige Zugriffsdaten
              verarbeitet werden, zum Beispiel IP-Adresse, Datum und Uhrzeit des
              Zugriffs, Browsertyp, Betriebssystem und aufgerufene Seiten.
            </p>
            <p className="mt-3">
              Die Verarbeitung erfolgt, um die Website sicher und zuverlässig
              bereitzustellen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">4. Warteliste</h2>
            <p>
              Wenn du dich in die Warteliste einträgst, verarbeiten wir deine
              E-Mail-Adresse, um dich über den Start der Khao Lak Insider App zu
              informieren.
            </p>
            <p className="mt-3">
              Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a
              DSGVO. Du kannst deine Einwilligung jederzeit widerrufen, indem du
              uns eine E-Mail an admin@khaolak.app sendest.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">5. Supabase</h2>
            <p>
              Für die Speicherung von Wartelisten-Einträgen kann Supabase
              eingesetzt werden. Dabei können insbesondere E-Mail-Adresse,
              Zeitpunkt der Anmeldung und technische Metadaten verarbeitet
              werden.
            </p>
            <p className="mt-3">
              Die Verarbeitung erfolgt zur Verwaltung der Warteliste auf
              Grundlage von Art. 6 Abs. 1 lit. a DSGVO.
            </p>
          </section>

          <section>
  <h2 className="mb-3 text-xl font-bold">6. Plausible Analytics</h2>

  <p>
    Diese Website verwendet Plausible Analytics zur statistischen Auswertung
    der Nutzung unserer Website.
  </p>

  <p className="mt-3">
    Plausible Analytics ist ein datenschutzfreundlicher Webanalyse-Dienst.
    Es werden keine Cookies eingesetzt und keine personenbezogenen Profile
    erstellt.
  </p>

  <p className="mt-3">
    Die erfassten Informationen werden ausschließlich in aggregierter Form
    verarbeitet. Ein Rückschluss auf einzelne Personen ist nicht möglich.
  </p>

  <p className="mt-3">
    Die Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses
    an der Analyse und Optimierung unseres Online-Angebots gemäß
    Art. 6 Abs. 1 lit. f DSGVO.
  </p>
</section>

          <section>
  <h2 className="mb-3 text-xl font-bold">7. Cookies</h2>

  <p>
    Diese Website verwendet derzeit keine Cookies zu Analyse- oder
    Marketingzwecken.
  </p>

  <p className="mt-3">
    Sofern künftig zusätzliche Dienste eingesetzt werden, die Cookies
    verwenden, werden wir hierüber gesondert informieren und erforderliche
    Einwilligungen einholen.
  </p>
</section>

          <section>
            <h2 className="mb-3 text-xl font-bold">8. Speicherdauer</h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie es für
              den jeweiligen Zweck erforderlich ist oder gesetzliche
              Aufbewahrungspflichten bestehen. Wartelisten-Daten werden gelöscht,
              wenn du deine Einwilligung widerrufst oder der Zweck entfällt.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">9. Deine Rechte</h2>
            <p>
              Du hast nach der DSGVO insbesondere das Recht auf Auskunft,
              Berichtigung, Löschung, Einschränkung der Verarbeitung,
              Datenübertragbarkeit sowie Widerspruch gegen bestimmte
              Verarbeitungen.
            </p>
            <p className="mt-3">
              Außerdem hast du das Recht, dich bei einer Datenschutzaufsichtsbehörde
              zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">10. Änderungen</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn
              sich technische, rechtliche oder organisatorische Änderungen ergeben.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}