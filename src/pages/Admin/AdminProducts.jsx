import React, { useEffect, useMemo, useState } from "react";

const AdminProducts = () => {
  const API_BASE = "https://vanda-cosmetic.onrender.com/api/admin";

  // --- STATES ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const [stockInputs, setStockInputs] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // --- LIGHTBOX / ZOOM STATE FOR IMAGES ---
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // --- FORM STATE ---
  const [productForm, setProductForm] = useState({
    category_id: "",
    name: "",
    description: "",
    brand: "",
    price: "",
    discount_price: "",
    stock: "",
    sku: "",
  });

  // --- FALLBACK CATEGORIES ---
  const fallbackCategories = [
    { id: 1, name: "Kurtis" },
  { id: 2, name: "Ethnic Wear" },
  { id: 3, name: "Bottom Wear" },
  { id: 4, name: "Western Wear" },
  { id: 5, name: "Cosmetics & Makeup" },
  { id: 6, name: "Skincare" },
  { id: 7, name: "Jewellery" },
  { id: 8, name: "Bags & Handbags" },
  { id: 9, name: "Footwear" },
  { id: 10, name: "Beauty Accessories" },
  { id: 11, name: "Hair Care" },
  { id: 12, name: "Fragrances" },
  { id: 13, name: "Sarees" },
  { id: 14, name: "Dupattas" },
  { id: 15, name: "Tops & Shirts" },
  { id: 16, name: "Dresses" },
  { id: 17, name: "Maxi" },
  { id: 19, name: "Beauty" },
  { id: 20, name: "Gift Frames" },
  { id: 21, name: "Gift Mug and cups" },
  { id: 22, name: "Earings" },
  { id: 23, name: "toys" },
  { id: 24, name: "gifts" },
  ];

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // --- FETCH PRODUCTS ---
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      if (data.success) {
        setProducts(Array.isArray(data.products) ? data.products : []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error);
      alert(error.message || "Unable to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // --- FETCH CATEGORIES ---
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(`${API_BASE}/categories`);
      const data = await res.json();

      if (
        res.ok &&
        data.success &&
        Array.isArray(data.categories) &&
        data.categories.length > 0
      ) {
        setCategories(data.categories);
      } else {
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error("Fetch Categories Error:", error);
      setCategories(fallbackCategories);
    } finally {
      setLoadingCategories(false);
    }
  };

  // --- IMAGE CHANGE ---
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // --- INPUT CHANGE ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- SUBMIT PRODUCT ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.category_id) {
      alert("Please select a category.");
      return;
    }

    if (!productForm.name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (!productForm.price) {
      alert("Product price is required.");
      return;
    }

    if (
      productForm.discount_price &&
      Number(productForm.discount_price) > Number(productForm.price)
    ) {
      alert("Discount price cannot be greater than regular price.");
      return;
    }

    if (!selectedImage) {
      alert("Please select a product image.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("category_id", productForm.category_id);
      formData.append("name", productForm.name.trim());
      formData.append("description", productForm.description.trim());
      formData.append("brand", productForm.brand.trim());
      formData.append("price", productForm.price);
      formData.append("discount_price", productForm.discount_price || "");
      formData.append("stock", productForm.stock || "0");
      formData.append("sku", productForm.sku.trim());
      formData.append("image", selectedImage);

      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Failed to add product.");
        return;
      }

      alert("🚀 Product added successfully!");
      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error("Add Product Error:", error);
      alert("Something went wrong while adding product.");
    } finally {
      setSaving(false);
    }
  };

  // --- RESET FORM ---
  const resetForm = () => {
    setProductForm({
      category_id: "",
      name: "",
      description: "",
      brand: "",
      price: "",
      discount_price: "",
      stock: "",
      sku: "",
    });

    setSelectedImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");

    const fileInput = document.getElementById("product-image-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // --- DELETE PRODUCT ---
  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete this product?\n\nThis will remove it from your inventory catalog and Supabase storage."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete product.");
        return;
      }

      alert("🗑️ Product deleted successfully.");
      await fetchProducts();
    } catch (error) {
      console.error("Delete Product Error:", error);
      alert("Unable to delete product.");
    }
  };

  // --- ADD STOCK ---
  const handleAddStock = async (productId) => {
    const qtyToAdd = Number(stockInputs[productId]);

    if (!Number.isInteger(qtyToAdd) || qtyToAdd <= 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${productId}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock_to_add: qtyToAdd,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update stock.");
        return;
      }

      setStockInputs((prev) => ({
        ...prev,
        [productId]: "",
      }));

      await fetchProducts();
      alert("📦 Stock updated successfully!");
    } catch (error) {
      console.error("Stock Error:", error);
      alert("Unable to update stock.");
    }
  };

  // --- CATEGORY NAME ---
  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
    return category?.name || "Uncategorized";
  };

  // --- MEMOIZED FILTERED PRODUCTS ---
  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name?.toLowerCase().includes(search) ||
        product.sku?.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        String(product.category_id) === String(selectedCategoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategoryFilter]);

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  return (
    <div style={containerStyle}>
      {/* HEADER BANNER */}
      <div style={headerNav}>
        <div style={brandContainer}>
          <h2 style={brandTitle}>🛍️ Vanda Cosmetic & Inventory Management</h2>
          <div style={badgeWrapper}>
            <span style={topBadge}>Total Items: {products.length}</span>
            <span style={topBadge}>Total Stock: {totalStock} Units</span>
            <span style={{ ...topBadge, background: "#10b981" }}>● Live Sync</span>
          </div>
        </div>
      </div>

      <div style={mainLayout}>
        {/* ADD NEW PRODUCT FORM (WIDTH INCREASED) */}
        <div style={sideContainer}>
          <div style={cardStyle}>
            <div style={formHeader}>
              <h3 style={{ margin: 0, color: "#1e1b4b" }}>➕ Add New Product</h3>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Configure catalog assets & pricing
              </p>
            </div>

            <form onSubmit={handleProductSubmit} style={flexCol}>
              <div style={formGroup}>
                <label style={labelStyle}>Category *</label>
                <select
                  name="category_id"
                  value={productForm.category_id}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">{loadingCategories ? "Loading..." : "-- Select Category --"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Matte Lipstick"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  placeholder="999"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Discount Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="discount_price"
                  value={productForm.discount_price}
                  onChange={handleInputChange}
                  placeholder="799"
                  style={inputStyle}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Initial Stock *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleInputChange}
                  placeholder="50"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>SKU Code</label>
                <input
                  type="text"
                  name="sku"
                  value={productForm.sku}
                  onChange={handleInputChange}
                  placeholder="SKU-001"
                  style={{ ...inputStyle, textTransform: "uppercase" }}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={productForm.brand}
                  onChange={handleInputChange}
                  placeholder="Vanda Exclusive"
                  style={inputStyle}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Product Image *</label>
                <input
                  id="product-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  style={{ ...inputStyle, padding: "8px", fontSize: "12px", background: "#f8fafc" }}
                  required
                />
                {imagePreview && (
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      onClick={() => setPreviewModalImg(imagePreview)}
                      style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                      title="Click to view full size"
                    />
                  </div>
                )}
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  placeholder="Product details & ingredients..."
                  rows="3"
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              <button type="submit" style={primaryBtn} disabled={saving}>
                {saving ? "Publishing Catalog..." : "🚀 Publish Product"}
              </button>
            </form>
          </div>
        </div>

        {/* INVENTORY CATALOG LIST & SEARCH */}
        <div style={listContainer}>
          <div style={topSearchRow}>
            <div style={totalRevenueCard}>
              <div style={revIcon}>🛍️</div>
              <div>
                <small style={{ opacity: 0.8, fontWeight: "600", fontSize: "11px" }}>ACTIVE INVENTORY</small>
                <h2 style={{ margin: 0, fontSize: "22px" }}>
                  {filteredProducts.length} <span style={{ fontSize: "13px", fontWeight: "normal" }}>Products</span>
                </h2>
              </div>
            </div>

            <div style={searchCard}>
              <span style={{ fontSize: "16px", color: "#94a3b8" }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name, SKU, brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInput}
              />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                style={filterSelect}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={tableWrapper}>
            <table style={fullTable}>
              <thead>
                <tr style={tableHeaderRow}>
                  <th style={{ ...thStyle, width: "28%" }}>Product Details</th>
                  <th style={{ ...thStyle, width: "16%" }}>Category</th>
                  <th style={{ ...thStyle, width: "14%" }}>Price</th>
                  <th style={{ ...thStyle, width: "14%" }}>Stock</th>
                  <th style={{ ...thStyle, width: "18%" }}>Restock</th>
                  <th style={{ ...thStyle, width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#4f46e5", fontWeight: "600" }}>
                      Loading inventory catalog...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "50px", textAlign: "center", color: "#94a3b8" }}>
                      <div style={{ fontSize: "36px", marginBottom: "8px" }}>📦</div>
                      <p style={{ margin: 0, fontWeight: "500" }}>No products found matching your search criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const isLowStock = Number(product.stock || 0) <= 5;
                    return (
                      <tr key={product.id} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc" }} className="erp-row">
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div 
                              onClick={() => product.image_url && setPreviewModalImg(product.image_url)}
                              style={{ width: "42px", height: "42px", borderRadius: "8px", backgroundColor: "#f1f5f9", overflow: "hidden", flexShrink: "0", border: "1px solid #e2e8f0", cursor: product.image_url ? "pointer" : "default" }}
                              title={product.image_url ? "Click to enlarge image" : ""}
                            >
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#94a3b8" }}>No Img</div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: "700", color: "#1e1b4b", fontSize: "13px" }}>{product.name}</div>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                {product.sku ? `SKU: ${product.sku}` : "No SKU"} {product.brand ? `• ${product.brand}` : ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ ...tdStyle, fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                          {getCategoryName(product.category_id)}
                        </td>

                        <td style={tdStyle}>
                          <div style={{ fontWeight: "700", color: "#059669", fontSize: "13px" }}>₹{product.price}</div>
                          {product.discount_price && Number(product.discount_price) > 0 && (
                            <div style={{ fontSize: "11px", color: "#e11d48", textDecoration: "line-through" }}>₹{product.discount_price}</div>
                          )}
                        </td>

                        <td style={{ ...tdStyle, fontWeight: "700", color: isLowStock ? "#dc2626" : "#16a34a", fontSize: "13px" }}>
                          {product.stock || 0} {isLowStock && <span style={{ fontSize: "10px", background: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>Low</span>}
                        </td>

                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={stockInputs[product.id] || ""}
                              onChange={(e) =>
                                setStockInputs((prev) => ({
                                  ...prev,
                                  [product.id]: e.target.value,
                                }))
                              }
                              style={{ width: "48px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" }}
                            />
                            <button onClick={() => handleAddStock(product.id)} style={smallAddBtn}>Add</button>
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <button onClick={() => handleDeleteProduct(product.id)} style={deleteAction}>Delete</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* IMAGE ZOOM LIGHTBOX MODAL */}
      {previewModalImg && (
        <div style={modalOverlayStyle} onClick={() => setPreviewModalImg(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button style={modalCloseBtn} onClick={() => setPreviewModalImg(null)}>✕</button>
            <img src={previewModalImg} alt="Enlarged Product" style={modalImgStyle} />
          </div>
        </div>
      )}

      <style>{`
        .erp-row:hover { background-color: #f1f5f9 !important; transition: background-color 0.15s ease; }
      `}</style>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { background: "#f8fafc", minHeight: "100vh", padding: "24px", fontFamily: "'Inter', sans-serif" };

const headerNav = { 
  display: "flex", justifyContent: "space-between", alignItems: "center", 
  marginBottom: "24px", backgroundColor: "#1e1b4b", padding: "20px 32px", 
  borderRadius: "14px", color: "white", boxShadow: "0 4px 20px rgba(30, 27, 75, 0.15)" 
};

const brandContainer = { display: "flex", flexDirection: "column" };
const brandTitle = { margin: 0, fontSize: "20px", fontWeight: "800" };
const badgeWrapper = { display: "flex", gap: "10px", marginTop: "6px" };
const topBadge = { background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" };

// Changed mainLayout to vertical stacking (sidebar now placed below or above, but user requested form width increased and product list below vertically)
const mainLayout = { display: "flex", flexDirection: "column", gap: "24px", alignItems: "stretch" };
const sideContainer = { width: "100%" }; // Width increased to 100% (full width container)
const listContainer = { width: "100%" };

const topSearchRow = { display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" };
const totalRevenueCard = { flex: "0 0 240px", background: "#1e1b4b", color: "white", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "14px" };
const revIcon = { fontSize: "24px", background: "rgba(255,255,255,0.1)", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" };
const searchCard = { flex: 1, background: "white", padding: "0 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" };
const searchInput = { border: "none", width: "100%", fontSize: "14px", padding: "14px 0", outline: "none", background: "transparent" };
const filterSelect = { border: "1px solid #cbd5e1", background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", fontWeight: "600", fontSize: "12px", outline: "none", color: "#334155" };

const tableWrapper = { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", overflowX: "auto", border: "1px solid #e2e8f0" };
const fullTable = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRow = { backgroundColor: "#1e1b4b" };
const thStyle = { padding: "14px 16px", fontSize: "11px", color: "white", textTransform: "uppercase", fontWeight: "700", textAlign: "left", letterSpacing: "0.5px" };
const tdStyle = { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

const cardStyle = { backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box" };
const flexCol = { display: "flex", flexDirection: "column", gap: "14px" };
const formGroup = { display: "flex", flexDirection: "column" };
const inputStyle = { padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", width: "100%", boxSizing: "border-box", outline: "none", background: "#fff", color: "#1e293b" };
const labelStyle = { fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px", display: "block", textTransform: "uppercase", letterSpacing: "0.3px" };
const primaryBtn = { backgroundColor: "#1e1b4b", color: "white", padding: "12px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "700", width: "100%", fontSize: "13px", marginTop: "4px" };
const smallAddBtn = { backgroundColor: "#1e1b4b", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" };
const formHeader = { marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" };
const deleteAction = { background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold", fontSize: "12px" };

// Lightbox Modal Styles
const modalOverlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex",
  justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px"
};
const modalContentStyle = {
  position: "relative", backgroundColor: "#fff", padding: "10px",
  borderRadius: "12px", maxWidth: "90vw", maxHeight: "90vh",
  display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 5px 30px rgba(0,0,0,0.3)"
};
const modalImgStyle = {
  maxWidth: "85vw", maxHeight: "80vh", objectFit: "contain", borderRadius: "8px"
};
const modalCloseBtn = {
  position: "absolute", top: "-15px", right: "-15px",
  backgroundColor: "#1e1b4b", color: "#fff", border: "none",
  borderRadius: "50%", width: "32px", height: "32px",
  fontSize: "16px", fontWeight: "bold", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
};

export default AdminProducts;