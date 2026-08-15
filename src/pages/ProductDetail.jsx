import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://vanda-cosmetic.onrender.com";

  // =====================================================
  // FETCH PRODUCT + SIMILAR PRODUCTS
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchJsonSafe = async (
      url,
      retries = 6,
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
              "Server did not return JSON"
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

    const loadDetails = async () => {
      try {
        setErrorMsg(
          "Waking up Render server & loading product details..."
        );

        const [prodData, similarData] =
          await Promise.all([
            fetchJsonSafe(
              `${API_BASE_URL}/api/admin/products`
            ),

            fetchJsonSafe(
              `${API_BASE_URL}/api/admin/products/${id}/similar`
            ).catch((err) => {
              console.error(
                "Similar products error:",
                err
              );

              return {
                products: [],
              };
            }),
          ]);

        if (!isMounted) return;

        const productList = Array.isArray(prodData)
          ? prodData
          : prodData.products || [];

        const foundProduct = productList.find(
          (p) =>
            String(p.id || p._id) ===
            String(id)
        );

        setProduct(foundProduct || null);

        const similarList = Array.isArray(
          similarData
        )
          ? similarData
          : similarData.products || [];

        // Randomize similar products slightly so it feels fresh on reload
        const shuffledSimilar = [...similarList].sort(
          () => Math.random() - 0.5
        );

        setSimilarProducts(shuffledSimilar);

        setErrorMsg("");
      } catch (err) {
        console.error(
          "Detail fetch error:",
          err
        );

        if (isMounted) {
          setErrorMsg(
            "Failed to load product details. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [id, API_BASE_URL]);

  // Handle click for redirect with page reload effect
  const handleProductClick = (simId) => {
    window.scrollTo(0, 0);
    navigate(`/product/${simId}`);
    window.location.reload();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={loadingContainer}>
        <div style={loadingTitle}>
          ⏳ Loading Product Details...
        </div>

        <div style={loadingMessage}>
          {errorMsg}
        </div>
      </div>
    );
  }

  // =====================================================
  // PRODUCT NOT FOUND
  // =====================================================

  if (!product) {
    return (
      <div style={notFoundContainer}>
        <h3 style={notFoundTitle}>
          Product not found!
        </h3>

        {errorMsg && (
          <p style={notFoundMessage}>
            {errorMsg}
          </p>
        )}

        <button
          onClick={() => navigate(-1)}
          style={backBtnStyle}
        >
          ← Back to Catalog
        </button>
      </div>
    );
  }

  // =====================================================
  // MAIN PRODUCT PRICE CALCULATION
  // =====================================================

  const originalPrice =
    Number(product.price) || 0;

  const discountAmount =
    Number(product.discount_price) || 0;

  const hasDiscount =
    discountAmount > 0 &&
    discountAmount < originalPrice;

  const finalPrice = hasDiscount
    ? originalPrice - discountAmount
    : originalPrice;

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div style={containerStyle}>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        style={backBtnStyle}
      >
        ← Back
      </button>

      {/* ERROR */}
      {errorMsg && (
        <div style={errorBox}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* PRODUCT DETAILS */}
      <div style={detailCardStyle}>

        {/* PRODUCT IMAGE SECTION */}
        <div style={imgContainerStyle}>
          <img
            src={
              product.image_url ||
              product.imageUrl ||
              "https://via.placeholder.com/300"
            }
            alt={product.name}
            style={mainImgStyle}
          />
        </div>

        {/* PRODUCT INFORMATION */}
        <div
          style={{
            flex: "1.2",
            minWidth: "280px",
          }}
        >
          {/* BRAND */}
          <span style={brandTagStyle}>
            {product.brand ||
              "Vanda Exclusive"}
          </span>

          {/* NAME */}
          <h1
            style={{
              margin: "8px 0 12px 0",
              fontSize: "24px",
              color: "#1e1b4b",
            }}
          >
            {product.name}
          </h1>

          {/* PRICE */}
          <div style={priceContainerStyle}>
            {hasDiscount ? (
              <>
                <span
                  style={detailOriginalPriceStyle}
                >
                  ₹{originalPrice.toFixed(2)}
                </span>
                <span
                  style={detailFinalPriceStyle}
                >
                  ₹{finalPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span
                style={detailNormalPriceStyle}
              >
                ₹{originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <p style={descriptionStyle}>
            {product.description ||
              "No description provided."}
          </p>

          {/* OTHER INFORMATION */}
          {product.brand && (
            <div style={infoRow}>
              <strong>Brand:</strong>
              <span>{product.brand}</span>
            </div>
          )}

          {product.category_name && (
            <div style={infoRow}>
              <strong>Category:</strong>
              <span>
                {product.category_name}
              </span>
            </div>
          )}

          {product.stock !== undefined && (
            <div style={infoRow}>
              <strong>Stock:</strong>
              <span>
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </span>
            </div>
          )}

        </div>
      </div>

      <hr
        style={{
          border: "0",
          borderTop:
            "1px solid #e2e8f0",
          margin: "30px 0",
        }}
      />

      {/* SIMILAR PRODUCTS - HORIZONTAL SCROLL */}
      <h3 style={similarTitle}>
        More Products
      </h3>

      <div style={horizontalScrollContainer}>
        {similarProducts.length === 0 ? (
          <p style={noSimilarStyle}>
            No similar products available.
          </p>
        ) : (
          similarProducts.map((sim) => {
            const simOriginalPrice =
              Number(sim.price) || 0;

            const simDiscountAmount =
              Number(sim.discount_price) || 0;

            const simHasDiscount =
              simDiscountAmount > 0 &&
              simDiscountAmount <
                simOriginalPrice;

            const simFinalPrice =
              simHasDiscount
                ? simOriginalPrice -
                  simDiscountAmount
                : simOriginalPrice;

            const simId =
              sim.id || sim._id;

            return (
              <div
                key={simId}
                onClick={() => handleProductClick(simId)}
                style={productCardStyle}
                className="sim-card-hover"
              >
                {/* IMAGE */}
                <div
                  style={similarImageContainer}
                >
                  <img
                    src={
                      sim.image_url ||
                      sim.imageUrl ||
                      "https://via.placeholder.com/150"
                    }
                    alt={sim.name}
                    style={similarImageStyle}
                  />
                </div>

                {/* DETAILS */}
                <div
                  style={similarDetailsStyle}
                >
                  <div
                    style={similarBrandStyle}
                  >
                    {sim.brand ||
                      "Vanda Exclusive"}
                  </div>

                  <h4
                    style={
                      similarProductNameStyle
                    }
                  >
                    {sim.name}
                  </h4>

                  <div
                    style={
                      similarPriceContainer
                    }
                  >
                    {simHasDiscount ? (
                      <>
                        <span
                          style={
                            similarOriginalPriceStyle
                          }
                        >
                          ₹
                          {simOriginalPrice.toFixed(
                            2
                          )}
                        </span>
                        <span
                          style={
                            similarFinalPriceStyle
                          }
                        >
                          ₹
                          {simFinalPrice.toFixed(
                            2
                          )}
                        </span>
                      </>
                    ) : (
                      <span
                        style={
                          similarNormalPriceStyle
                        }
                      >
                        ₹
                        {simOriginalPrice.toFixed(
                          2
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .sim-card-hover {
          transition: all 0.2s ease;
        }

        .sim-card-hover:hover {
          transform: translateY(-3px);
          box-shadow:
            0 8px 20px
            rgba(0,0,0,0.08) !important;
        }

        /* Custom scrollbar for horizontal view */
        div::-webkit-scrollbar {
          height: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
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
  fontSize: "18px",
  fontWeight: "700",
  color: "#1e1b4b",
  marginBottom: "10px",
};

const loadingMessage = {
  fontSize: "13px",
  color: "#64748b",
  maxWidth: "400px",
  margin: "0 auto",
};

const notFoundContainer = {
  padding: "60px 20px",
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
};

const notFoundTitle = {
  color: "#ef4444",
};

const notFoundMessage = {
  fontSize: "13px",
  color: "#64748b",
  margin: "10px 0",
};

const containerStyle = {
  background: "#f8fafc",
  minHeight: "100vh",
  padding: "20px",
  fontFamily: "'Inter', sans-serif",
  maxWidth: "800px",
  margin: "0 auto",
};

const backBtnStyle = {
  backgroundColor: "#1e1b4b",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "12px",
  marginBottom: "16px",
};

const errorBox = {
  background: "#fef2f2",
  color: "#991b1b",
  padding: "12px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
  fontSize: "13px",
  border: "1px solid #fecaca",
};

const detailCardStyle = {
  display: "flex",
  gap: "24px",
  background: "white",
  padding: "24px",
  borderRadius: "16px",
  boxShadow:
    "0 4px 20px rgba(0,0,0,0.04)",
  border: "1px solid #e2e8f0",
  flexWrap: "wrap",
};

const imgContainerStyle = {
  flex: "1",
  minWidth: "260px",
  height: "320px",
  borderRadius: "10px",
  overflow: "hidden",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mainImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  cursor: "pointer",
};

const brandTagStyle = {
  display: "inline-block",
  background: "#e0e7ff",
  color: "#4f46e5",
  padding: "4px 10px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
};

const priceContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
};

const detailOriginalPriceStyle = {
  fontSize: "15px",
  color: "#64748b",
  textDecoration: "line-through",
  fontWeight: "500",
};

const detailFinalPriceStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#059669",
};

const detailNormalPriceStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "#059669",
};

const descriptionStyle = {
  color: "#64748b",
  lineHeight: "1.5",
  fontSize: "13px",
  marginBottom: "12px",
};

const infoRow = {
  display: "flex",
  gap: "8px",
  fontSize: "13px",
  color: "#475569",
  marginTop: "6px",
};

const similarTitle = {
  marginBottom: "12px",
  color: "#1e1b4b",
  fontSize: "16px",
  fontWeight: "700",
};

const noSimilarStyle = {
  color: "#94a3b8",
  fontSize: "13px",
};

/* Horizontal Scroll Container for More Products */
const horizontalScrollContainer = {
  display: "flex",
  gap: "12px",
  overflowX: "auto",
  paddingBottom: "10px",
  scrollBehavior: "smooth",
};

const productCardStyle = {
  minWidth: "150px",
  maxWidth: "150px",
  backgroundColor: "white",
  borderRadius: "10px",
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  flexShrink: 0,
  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
};

const similarImageContainer = {
  width: "100%",
  height: "130px",
  backgroundColor: "#f8fafc",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: "1px solid #f1f5f9",
};

const similarImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const similarDetailsStyle = {
  padding: "10px",
};

const similarBrandStyle = {
  fontSize: "9px",
  color: "#64748b",
  marginBottom: "2px",
  textTransform: "uppercase",
};

const similarProductNameStyle = {
  margin: "0 0 6px 0",
  fontSize: "12px",
  color: "#1e1b4b",
  fontWeight: "700",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const similarPriceContainer = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const similarOriginalPriceStyle = {
  fontSize: "10px",
  color: "#64748b",
  textDecoration: "line-through",
};

const similarFinalPriceStyle = {
  fontSize: "12px",
  fontWeight: "800",
  color: "#059669",
};

const similarNormalPriceStyle = {
  fontSize: "12px",
  fontWeight: "800",
  color: "#059669",
};

export default ProductDetail;