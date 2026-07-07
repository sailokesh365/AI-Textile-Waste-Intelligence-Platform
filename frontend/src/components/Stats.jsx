import "./Stats.css";

function Stats() {
  return (
    <section className="stats">
      <h2>Our Impact</h2>

      <div className="stats-container">

        <div className="stat-card">
          <h1>5000+</h1>
          <p>Images Analyzed</p>
        </div>

        <div className="stat-card">
          <h1>95%</h1>
          <p>AI Accuracy</p>
        </div>

        <div className="stat-card">
          <h1>100+</h1>
          <p>Fabric Categories</p>
        </div>

        <div className="stat-card">
          <h1>24/7</h1>
          <p>Smart Assistance</p>
        </div>

      </div>
    </section>
  );
}

export default Stats;