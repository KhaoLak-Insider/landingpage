export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="overlay">
          <nav className="navbar">
            <div className="logo">
              Khao Lak Insider
            </div>

            <div className="navlinks">
              <a href="#">Entdecken</a>
              <a href="#">Planen</a>
              <a href="#">Erleben</a>
              <a href="#">Favoriten</a>
              <a href="#">Community</a>
            </div>

            <button className="download-btn">
              App herunterladen
            </button>
          </nav>

          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Dein perfekter <br />
                Begleiter für <span>Khao Lak</span>
              </h1>

              <p>
                Entdecke die schönsten Orte,
                versteckte Geheimtipps und echte
                Empfehlungen – offline verfügbar.
              </p>

              <div className="buttons">
                <button className="primary">
                  App herunterladen
                </button>

                <button className="secondary">
                  Video ansehen
                </button>
              </div>
            </div>

            <div className="phone-mockup">
              📱
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}