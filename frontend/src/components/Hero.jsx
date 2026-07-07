import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>AI Textile Waste Intelligence Platform</h1>

        <p>
          Upload textile images to identify fabric types, classify textile
          waste, and receive AI-assisted recycling recommendations using
          machine learning.
        </p>

        <button>Upload Textile Image</button>
      </div>
    </section>
  );
}