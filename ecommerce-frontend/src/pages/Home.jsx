import { useEffect, useState } from "react";
import "./Home.css";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (replace with API later)
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="home-container">
      <div className="banner">PPS Banner</div>

      <h2 className="section-title">Featured Products</h2>

      <div className="product-grid">
        <div className="product-card">Item 1</div>
        <div className="product-card">Item 2</div>
        <div className="product-card">Item 3</div>
        <div className="product-card">Item 4</div>
      </div>
    </div>
  );
}
