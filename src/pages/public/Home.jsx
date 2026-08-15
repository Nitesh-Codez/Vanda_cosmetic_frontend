import React from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Women",
    image: "/images/women.jpg",
  },
  {
    id: 2,
    name: "Men",
    image: "/images/men.jpg",
  },
  {
    id: 3,
    name: "Electronics",
    image: "/images/electronics.jpg",
  },
  {
    id: 4,
    name: "Home",
    image: "/images/home.jpg",
  },
];

const products = [
  {
    id: 1,
    name: "Women's Kurti",
    price: 499,
    image: "/images/kurti.jpg",
  },
  {
    id: 2,
    name: "Men's Shirt",
    price: 699,
    image: "/images/shirt.jpg",
  },
  {
    id: 3,
    name: "Smart Watch",
    price: 999,
    image: "/images/watch.jpg",
  },
  {
    id: 4,
    name: "Home Decor",
    price: 399,
    image: "/images/decor.jpg",
  },
];

function Home() {
  return (
    <div className="home-page">

      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Everything You Love, At Great Prices</h1>

          <p>
            Discover fashion, electronics, home products and more.
          </p>

          <Link to="/products" className="shop-btn">
            Shop Now
          </Link>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop By Category</h2>

          <Link to="/categories">
            View All
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={`/category/${category.id}`}
              className="category-card"
              key={category.id}
            >
              <img
                src={category.image}
                alt={category.name}
              />

              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="products-section">
        <div className="section-header">
          <h2>Popular Products</h2>

          <Link to="/products">
            View All
          </Link>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <Link
              to={`/product/${product.id}`}
              className="product-card"
              key={product.id}
            >
              <img
                src={product.image}
                alt={product.name}
              />

              <div className="product-info">
                <h3>{product.name}</h3>

                <p className="product-price">
                  ₹{product.price}
                </p>

                <span className="view-product">
                  View Product
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= OFFER BANNER ================= */}
      <section className="offer-section">
        <div className="offer-content">
          <h2>Special Offers</h2>

          <p>
            Get amazing deals on your favourite products.
          </p>

          <Link to="/products" className="offer-btn">
            Explore Deals
          </Link>
        </div>
      </section>

      {/* ================= WHY US ================= */}
      <section className="features-section">

        <div className="feature">
          <span>🚚</span>
          <h3>Fast Delivery</h3>
          <p>Quick and reliable delivery.</p>
        </div>

        <div className="feature">
          <span>💰</span>
          <h3>Best Prices</h3>
          <p>Great products at affordable prices.</p>
        </div>

        <div className="feature">
          <span>🔒</span>
          <h3>Secure Payment</h3>
          <p>Your payment is safe and secure.</p>
        </div>

        <div className="feature">
          <span>↩️</span>
          <h3>Easy Returns</h3>
          <p>Simple and hassle-free returns.</p>
        </div>

      </section>

    </div>
  );
}

export default Home;