import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Car Diary — home page">
          <span className="brand-mark" aria-hidden="true">
            CD
          </span>
          <span>Car Diary</span>
        </a>
        <span className="app-status">Early version</span>
      </header>

      <main className="hero">
        <p className="eyebrow">Your car's history</p>
        <h1>Every service and expense in one place.</h1>
        <p className="hero-description">
          Car Diary helps you keep track of repairs, inspections, mileage, and
          the cost of owning your car.
        </p>

        <section className="roadmap" aria-labelledby="roadmap-title">
          <h2 id="roadmap-title">What is coming in the first version?</h2>
          <ul>
            <li>Vehicle profile</li>
            <li>Service history</li>
            <li>Expenses and mileage</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
