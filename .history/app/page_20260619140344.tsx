export default function Home() {
  return (
    <main>
      <section
        className="hero"
        style={{
          backgroundImage: "url('/images/hero.png')",
        }}
      >
        <div className="overlay">
          <nav className="navbar">
            <div className="logo">Khao Lak Insider</div>

            <div className="navlinks">
              <a href="#">Entdecken</a>
              <a href="#">Planen</a>
              <a href="#">Erleben</a>
              <a href="#">Favoriten</a>
              <a href="#">Community</a>
            </div>

            <button className="download-btn">
              Zur Warteliste
            </button>
          </nav>

          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Dein perfekter
                <br />
                Begleiter für
                <br />
                <span>Khao Lak</span>
              </h1>

              <p>
                Entdecke die schönsten Orte,
                versteckte Geheimtipps und echte
                Empfehlungen für deinen Urlaub.
              </p>

              <div className="buttons">
                <button className="primary">
                  Zur Warteliste
                </button>

                <button className="secondary">
                  Mehr erfahren
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