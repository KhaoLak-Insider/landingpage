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
              <br />
              <br />
              E-Mail: reisedichfrei@gmail.com
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">2. Allgemeine Hinweise</h2>
            <p>
              Wir nehmen den Schutz personenbezogener Daten sehr ernst.
              Personenbezogene Daten werden nur verarbeitet, soweit dies zur
              Bereitstellung dieser Website, zur Bearbeitung von Anfragen, zur 
              Verwaltung von Nutzerkonten oder zum Betrieb der Warteliste erforderlich ist.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              3. Zugriffsdaten und Hosting
            </h2>
            <p>
              Diese Website wird bei Vercel gehostet. Beim
              Aufruf der Website werden technisch notwendige Zugriffsdaten
              verarbeitet, zum Beispiel IP-Adresse, Datum und Uhrzeit des
              Zugriffs, Browsertyp, Betriebssystem und aufgerufene Seiten.
            </p>
            <p className="mt-3">
              Die Verarbeitung erfolgt, um die Website sicher und zuverlässig
              bereitzustellen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">4. Warteliste und Nutzerkonten</h2>
            <p>
              Wenn du dich in die Warteliste einträgst oder ein Nutzerkonto erstellst, 
              verarbeiten wir deine E-Mail-Adresse sowie Profildaten, um dich über den 
              Start der Khao Lak Insider App zu informieren oder dir die personalisierten 
              Funktionen der Plattform zur Verfügung zu stellen.
            </p>
            <p className="mt-3">
              Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a
              DSGVO bzw. die Bereitstellung des Dienstes nach Art. 6 Abs. 1 lit. b DSGVO. 
              Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, 
              indem du uns eine E-Mail an reisedichfrei@gmail.com sendest.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">5. Supabase</h2>
            <p>
              Für die Authentifizierung, Speicherung von Profilen, Wartelisten-Einträgen 
              und Anwendungsdaten wird der Backend-Dienst Supabase eingesetzt. Dabei werden 
              insbesondere E-Mail-Adressen, Passwörter (verschlüsselt), Avatare, Zeitpunkte 
              der Anmeldung und technische Metadaten verarbeitet.
            </p>
            <p className="mt-3">
              Die Verarbeitung erfolgt zur sicheren Bereitstellung und Verwaltung der Nutzerkonten 
              auf Grundlage von Art. 6 Abs. 1 lit. b und lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">6. Webanalyse mit Vercel Analytics</h2>
            <p>
              Diese Website nutzt den Webanalyse-Dienst Vercel Analytics der Vercel Inc.,
              440 N Barranca Ave #4133, Covina, CA 91723, USA.
            </p>
            <p className="mt-3">
              Vercel Analytics ermöglicht eine anonyme Analyse der Nutzung dieser Website.
              Es werden keine Cookies gesetzt und keine personenbezogenen Profile erstellt.
            </p>
            <p className="mt-3">
              Erfasst werden unter anderem Seitenaufrufe, Gerätetyp, Browsertyp,
              ungefährer Standort (Land) sowie Referrer-Informationen.
            </p>
            <p className="mt-3">
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der Optimierung und Analyse unseres Webangebots).
            </p>
            <p className="mt-3">
              Weitere Informationen findest du hier:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 underline hover:text-teal-700"
              >
                Vercel Datenschutzerklärung
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">7. Cookies</h2>
            <p>
              Diese Website verwendet derzeit keine Cookies zu Analyse- oder
              Marketingzwecken. Technische Cookies, die für den Login-Status (Supabase Session) 
              zwingend erforderlich sind, werden auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO gesetzt.
            </p>
            <p className="mt-3">
              Sofern künftig zusätzliche Dienste eingesetzt werden, die optionale Cookies
              verwenden, werden wir hierüber gesondert informieren und erforderliche
              Einwilligungen einholen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">8. Speicherdauer</h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie es für
              den jeweiligen Zweck erforderlich ist oder gesetzliche
              Aufbewahrungspflichten bestehen. Wartelisten- und Kontodaten werden gelöscht,
              wenn du dein Konto löschst, deine Einwilligung widerrufst oder der Zweck entfällt.
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