import "./Features.css";

function Features() {
  return (
    <section className="features">
      <h2>Platform Features</h2>

      <div className="feature-cards">

        <div className="card">
          <h3>🧵 Fabric Identification</h3>
          <p>
            Detect fabric type such as Cotton, Silk, Polyester and Denim
            using AI image analysis.
          </p>
        </div>

        <div className="card">
          <h3>♻ Waste Classification</h3>
          <p>
            Classify textile waste into reusable, recyclable and landfill
            categories automatically.
          </p>
        </div>

        <div className="card">
          <h3>🤖 AI Recommendations</h3>
          <p>
            Get smart recycling suggestions and sustainable disposal methods.
          </p>
        </div>

      </div>
    </section>
  );
}

export default Features;