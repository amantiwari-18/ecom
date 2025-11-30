import { Link } from "react-router-dom";
import "./MobileNav.css";

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/login">Account</Link>
    </nav>
  );
}
