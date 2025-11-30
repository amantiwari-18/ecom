import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";

import MobileNav from "./components/common/MobileNav";
import DesktopNav from "./components/common/DesktopNav";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

import Login from "./components/auth/Login";

import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AuthProvider>
      <Router>
        {!isMobile && <DesktopNav />}
        
        <main style={{ padding: "1rem" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        {isMobile && <MobileNav />}
      </Router>
    </AuthProvider>
  );
}

export default App;
