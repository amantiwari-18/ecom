import { Link } from "react-router-dom";
import "./DesktopNav.css";

export default function DesktopNav() {
  return (
    <header className="desktop-nav">
      <h2 className="logo">PPS</h2>

      <div className="menu">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/login">Login</Link>
      </div>
    </header>
  );
}
