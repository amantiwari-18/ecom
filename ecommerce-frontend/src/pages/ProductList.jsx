import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../services/product.service";
import { getCategories } from "../services/category.service";
import "./ProductList.css";

const ProductList = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productRes = await getProducts();
        const categoryRes = await getCategories();

        setProducts(productRes.data || []);
        setCategories(categoryRes.data || []);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(p => p.category?.id === selectedCategory);

  if (loading) return <div className="page-center">Loading...</div>;
  if (error) return <div className="page-center">{error}</div>;

  return (
    <div className="product-list-page">
      {/* Category Filter */}
      <div className="category-bar">
        <button
          className={selectedCategory === "all" ? "active" : ""}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            className={selectedCategory === cat.id ? "active" : ""}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="product-grid">
        {filteredProducts.map(product => {
          const imageUrl = product.image
            ? `http://localhost:8080/uploads/${product.image}`
            : null;

          return (
            <div
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="product-image">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.name} />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">₹{product.price}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
