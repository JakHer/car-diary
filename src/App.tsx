import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Car Diary — strona główna">
          <span className="brand-mark" aria-hidden="true">
            CD
          </span>
          <span>Car Diary</span>
        </a>
        <span className="app-status">Wersja startowa</span>
      </header>

      <main className="hero">
        <p className="eyebrow">Historia Twojego samochodu</p>
        <h1>Wszystkie serwisy i wydatki w jednym miejscu.</h1>
        <p className="hero-description">
          Car Diary pomoże Ci zapisywać naprawy, przeglądy, przebieg oraz
          koszty eksploatacji auta.
        </p>

        <section className="roadmap" aria-labelledby="roadmap-title">
          <h2 id="roadmap-title">Co znajdzie się w pierwszej wersji?</h2>
          <ul>
            <li>Profil samochodu</li>
            <li>Historia serwisowa</li>
            <li>Koszty i przebieg</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
