import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://vanda-cosmetic.onrender.com";

  // =====================================================
  // FETCH PRODUCTS + CATEGORIES
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchWithRetry = async (
      url,
      retries = 5,
      delay = 3000
    ) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url);

          if (!res.ok) {
            throw new Error(
              `HTTP ${res.status}: ${res.statusText}`
            );
          }

          const contentType =
            res.headers.get("content-type");

          if (
            !contentType ||
            !contentType.includes("application/json")
          ) {
            throw new Error(
              `Expected JSON response from ${url}`
            );
          }

          return await res.json();
        } catch (err) {
          console.error(
            `Attempt ${i + 1} failed:`,
            err.message
          );

          if (i === retries - 1) {
            throw err;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, delay)
          );
        }
      }
    };

    const loadData = async () => {
      try {
        setErrorMsg(
          "Please wait...."
        );

        const [prodData, catData] =
          await Promise.all([
            // PRODUCTS
            fetchWithRetry(
              `${API_BASE_URL}/api/admin/products`
            ),

            // CATEGORIES
            fetchWithRetry(
              `${API_BASE_URL}/api/admin/categories`
            ).catch(() => ({
              categories: [],
            })),
          ]);

        if (!isMounted) return;

        const rawProducts = Array.isArray(prodData)
          ? prodData
          : prodData.products || [];

        // =====================================================
        // RANDOM SHUFFLE ON EVERY REFRESH (Upar-Neeche Position)
        // =====================================================
        const shuffledProducts = [...rawProducts].sort(
          () => Math.random() - 0.5
        );

        setProducts(shuffledProducts);

        setCategories(
          catData.categories || []
        );

        setErrorMsg("");
      } catch (err) {
        console.error("Fetch error:", err);

        if (isMounted) {
          setErrorMsg(
            "Could not connect to backend. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL]);

  // =====================================================
  // SEARCH + CATEGORY FILTER
  // =====================================================

  const filteredProducts = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.brand
          ?.toLowerCase()
          .includes(search);

      const matchesCategory =
        selectedCategory === "all" ||
        String(product.category_id) ===
          String(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
  ]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={loadingContainer}>
        <div style={loadingTitle}>
          🛍️ Loading Collection...
        </div>

        {errorMsg && (
          <div style={loadingMessage}>
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div style={containerStyle}>

      {/* HEADER */}
      <div style={headerNav}>
        <h2 style={brandTitle}>
          🛍️ Vanda Cosmetic & Boutique
        </h2>

        <span style={topBadge}>
          Explore Collection
        </span>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div style={errorBox}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* SEARCH + CATEGORY */}
      <div style={searchCard}>

        <span style={searchIcon}>
          🔍
        </span>

        <input
          type="text"
          placeholder="Search products, brands..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={searchInput}
        />

        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value)
          }
          style={filterSelect}
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
            >
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* PRODUCTS GRID */}
      <div style={gridStyle}>

        {filteredProducts.length === 0 ? (
          <div style={noProducts}>
            <h3>No products found</h3>
          </div>
        ) : (
          filteredProducts.map((product) => {

            const productId =
              product.id || product._id;

            // ==========================================
            // PRICE CALCULATION
            // ==========================================

            const originalPrice =
              Number(product.price) || 0;

            const discountAmount =
              Number(product.discount_price) || 0;

            const finalPrice =
              discountAmount > 0
                ? originalPrice - discountAmount
                : originalPrice;

            // ==========================================
            // VALID DISCOUNT CHECK
            // ==========================================

            const hasDiscount =
              discountAmount > 0 &&
              discountAmount < originalPrice;

            return (
              <div
                key={productId}
                onClick={() =>
                  navigate(
                    `/product/${productId}`
                  )
                }
                style={productCard}
                className="product-card-hover"
              >

                {/* PRODUCT IMAGE */}
                <div style={imageWrapper}>
                  <img
                    src={
                      product.image_url ||
                      product.imageUrl ||
                      "https://via.placeholder.com/200"
                    }
                    alt={product.name}
                    style={productImg}
                  />
                </div>

                {/* PRODUCT DETAILS */}
                <div style={productDetails}>

                  {/* BRAND */}
                  <div style={brandStyle}>
                    {product.brand ||
                      "Vanda Exclusive"}
                  </div>

                  {/* PRODUCT NAME */}
                  <h4 style={productName}>
                    {product.name}
                  </h4>

                  {/* PRICE */}
                  <div style={priceSection}>

                    {hasDiscount ? (
                      <>
                        <span
                          style={originalPriceStyle}
                        >
                          ₹{originalPrice.toFixed(2)}
                        </span>

                        <span
                          style={finalPriceStyle}
                        >
                          ₹{finalPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span
                        style={normalPriceStyle}
                      >
                        ₹{originalPrice.toFixed(2)}
                      </span>
                    )}

                  </div>

                </div>
              </div>
            );
          })
        )}

      </div>

      {/* HOVER STYLE */}
      <style>{`
        .product-card-hover:hover {
          transform: translateY(-3px);
          box-shadow:
            0 8px 20px
            rgba(0,0,0,0.08) !important;
        }
      `}</style>

    </div>
  );
};

// =====================================================
// STYLES
// =====================================================

const loadingContainer = {
  padding: "80px 20px",
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
};

const loadingTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e1b4b",
  marginBottom: "8px",
};

const loadingMessage = {
  fontSize: "12px",
  color: "#64748b",
};

const containerStyle = {
  background: "#f8fafc",
  minHeight: "100vh",
  padding: "16px",
  fontFamily: "'Inter', sans-serif",
  maxWidth: "600px",
  margin: "0 auto",
};

const headerNav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  backgroundColor: "#1e1b4b",
  padding: "14px 20px",
  borderRadius: "12px",
  color: "white",
  boxShadow:
    "0 4px 15px rgba(30, 27, 75, 0.15)",
};

const brandTitle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "800",
};

const topBadge = {
  background: "rgba(255,255,255,0.15)",
  padding: "3px 8px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "600",
};

const errorBox = {
  background: "#fef2f2",
  color: "#991b1b",
  padding: "10px 12px",
  borderRadius: "8px",
  marginBottom: "16px",
  fontSize: "12px",
  border: "1px solid #fecaca",
};

const searchCard = {
  background: "white",
  padding: "0 12px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  boxShadow:
    "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #e2e8f0",
  marginBottom: "16px",
};

const searchIcon = {
  fontSize: "16px",
  color: "#94a3b8",
};

const searchInput = {
  border: "none",
  width: "100%",
  fontSize: "13px",
  padding: "12px 0",
  outline: "none",
  background: "transparent",
};

const filterSelect = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  padding: "6px 10px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "11px",
  outline: "none",
  color: "#334155",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "12px",
};

const noProducts = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: "40px",
  color: "#94a3b8",
};

const productCard = {
  backgroundColor: "white",
  borderRadius: "10px",
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow:
    "0 2px 6px rgba(0,0,0,0.02)",
};

const imageWrapper = {
  width: "100%",
  height: "150px",
  backgroundColor: "#f1f5f9",
  overflow: "hidden",
};

const productImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const productDetails = {
  padding: "10px",
};

const brandStyle = {
  fontSize: "11px",
  color: "#64748b",
  marginBottom: "2px",
  textTransform: "uppercase",
};

const productName = {
  margin: "0 0 6px 0",
  fontSize: "13px",
  color: "#1e1b4b",
  fontWeight: "700",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const priceSection = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  minHeight: "20px",
};

const originalPriceStyle = {
  fontSize: "11px",
  color: "#64748b",
  textDecoration: "line-through",
  fontWeight: "500",
};

const finalPriceStyle = {
  fontWeight: "800",
  color: "#059669",
  fontSize: "14px",
};

const normalPriceStyle = {
  fontWeight: "800",
  color: "#059669",
  fontSize: "14px",
};

export default HomePage;