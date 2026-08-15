import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaMapMarkerAlt } from "react-icons/fa";

export default function CartAndCheckout({ studentId }) {
  const storedUser = JSON.parse(localStorage.getItem("user") || localStorage.getItem("vanda_user") || "{}");
  const userId = studentId || storedUser?.id || storedUser?._id || 1;

  const [cartItems, setCartItems] = useState([
    { id: 1, name: "SmartZone Premium Kit", variant: "Gold Edition", price: 499, quantity: 1, image_url: "https://via.placeholder.com/150" },
    { id: 2, name: "Advanced Study Notes", variant: "Full Syllabus", price: 299, quantity: 2, image_url: "https://via.placeholder.com/150" }
  ]);

  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const [addressForm, setAddressForm] = useState({
    full_name: "", phone: "", address_line1: "", city: "", state: "", pincode: "", address_type: "Home", is_default: true
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("vanda_cart") || localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed.length > 0) setCartItems(parsed);
      } catch (e) {
        console.error("Cart parse error", e);
      }
    }

    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get(`/api/profile/${userId}`);
        if (data) {
          const userData = data.user || data;
          setAddressForm(prev => ({
            ...prev,
            full_name: userData.name || storedUser?.name || "",
            phone: userData.phone || storedUser?.phone || "",
            address_line1: userData.address || userData.address_line1 || "",
            city: userData.city || "",
            state: userData.state || "",
            pincode: userData.pincode || "",
          }));
          if (data.default_address_id || userData.address_id) {
            setAddressId(data.default_address_id || userData.address_id);
          }
        }
      } catch (err) {
        if (storedUser) {
          setAddressForm(prev => ({
            ...prev,
            full_name: storedUser.name || "",
            phone: storedUser.phone || "",
            address_line1: storedUser.address || "",
          }));
        }
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleQuantityChange = (id, delta) => {
    const updated = cartItems.map(item => {
      if (item.id === id || item._id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem("vanda_cart", JSON.stringify(updated));
  };

  const handleRemoveItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id && item._id !== id);
    setCartItems(updated);
    localStorage.setItem("vanda_cart", JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 50;
  const total = subtotal - discount + (subtotal > 0 ? shipping : 0);

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            setAddressForm(prev => ({
              ...prev,
              address_line1: data.display_name || `${addr.road || ""}, ${addr.suburb || ""}`,
              city: addr.city || addr.town || addr.village || addr.state_district || "",
              state: addr.state || "",
              pincode: addr.postcode || "",
            }));
            alert("Live location fetched successfully!");
          }
        } catch (err) {
          alert("Failed to fetch address details.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert("Location access denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/api/address/${userId}`, addressForm);
      if (data.success) {
        alert("Address Saved Successfully! ID: " + data.address.id);
        setAddressId(data.address.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!addressId) {
      alert("Please save and select a delivery address first!");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        address_id: Number(addressId),
        payment_method: paymentMethod,
        shipping_charge: shipping,
        discount_amount: discount,
      };

      const { data } = await api.post(`/api/order/${userId}`, orderPayload);
      if (data.success) {
        alert(`🎉 Order Placed Successfully! Order No: ${data.order.order_number}`);
        localStorage.removeItem("vanda_cart");
        setCartItems([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={appContainer}>
      <header style={headerSection}>
        <div style={brandGroup}>
          <div style={logoBox}><FaShoppingCart color="#fff" /></div>
          <div>
            <h1 style={mainTitle}>Secure Checkout</h1>
            <p style={subTitle}>Student Store & Registry</p>
          </div>
        </div>
        <div style={statsContainer}>
          <div style={statItem}>
            <span style={statVal}>UID-{userId}</span>
            <span style={statLab}>Active User</span>
          </div>
          <div style={statDivider} />
          <div style={statItem}>
            <span style={statVal}>{cartItems.reduce((a, c) => a + c.quantity, 0)} Items</span>
            <span style={statLab}>Cart Count</span>
          </div>
        </div>
      </header>

      <main style={contentWrapper}>
        <div style={centerPanel}>
          <div style={gridContainer}>
            
            {/* LEFT: PRODUCTS & ADDRESS FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* CART PRODUCTS LIST */}
              <div style={cardBox}>
                <h3 style={sectionHeading}>Review Cart</h3>
                {cartItems.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Your cart is empty.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cartItems.map((item) => (
                      <div key={item.id || item._id} style={cartItemRow}>
                        <img src={item.image_url || "https://via.placeholder.com/150"} alt={item.name} style={itemImg} />
                        <div style={{ flex: 1 }}>
                          <h4 style={itemName}>{item.name}</h4>
                          <p style={itemVariant}>{item.variant || "Standard"}</p>
                          <span style={itemPrice}>₹{item.price}</span>
                        </div>
                        <div style={qtyControlBox}>
                          <button onClick={() => handleQuantityChange(item.id || item._id, -1)} style={qtyBtn}><FaMinus size={10} /></button>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', width: '20px', textAlign: 'center', color: '#1e293b' }}>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id || item._id, 1)} style={qtyBtn}><FaPlus size={10} /></button>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id || item._id)} style={removeBtn}><FaTrash size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ADDRESS FORM */}
              <div style={cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={sectionHeading}>Delivery Address</h3>
                  <button onClick={handleUseLiveLocation} disabled={locating} style={locationBtn}>
                    <FaMapMarkerAlt /> {locating ? "Detecting..." : "Live Location"}
                  </button>
                </div>

                <form onSubmit={handleAddAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" required value={addressForm.full_name} onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })} style={inputStyle} placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="text" required value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} style={inputStyle} placeholder="9876543210" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Street Address</label>
                    <input type="text" required value={addressForm.address_line1} onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })} style={inputStyle} placeholder="House No, Street, Landmark" />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input type="text" required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} style={inputStyle} placeholder="Gwalior" />
                  </div>
                  <div>
                    <label style={labelStyle}>Pincode</label>
                    <input type="text" required value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} style={inputStyle} placeholder="474001" />
                  </div>
                  <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                    <button type="submit" style={saveAddressBtn}>SAVE & SELECT ADDRESS</button>
                  </div>
                </form>
              </div>

            </div>

            {/* RIGHT: ORDER SUMMARY STICKY PANEL */}
            <div>
              <div style={{ ...cardBox, position: 'sticky', top: '10px' }}>
                <h3 style={sectionHeading}>Order Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px' }}>
                  <div style={summaryRow}>
                    <span style={{ color: '#64748b' }}>Subtotal</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={summaryRow}>
                    <span style={{ color: '#64748b' }}>Shipping</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  {discount > 0 && (
                    <div style={summaryRow}>
                      <span style={{ color: '#10b981' }}>Discount</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>-₹{discount}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input type="text" placeholder="Coupon Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} style={{ ...inputStyle, marginBottom: 0, textTransform: 'uppercase' }} />
                  <button onClick={() => { if (coupon === "GOLD10") { setDiscount(50); alert("Coupon applied!"); } else { alert("Invalid coupon"); } }} style={couponBtn}>Apply</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginBottom: '20px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>Total Amount</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#d97706' }}>₹{total.toFixed(2)}</span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="Online">Online Payment (UPI / Card)</option>
                  </select>
                </div>

                <div style={addressIdBox}>
                  <span style={{ color: '#64748b' }}>Active Address ID:</span>
                  <strong style={{ color: '#d97706' }}>{addressId || "Not Selected"}</strong>
                </div>

                <button onClick={handlePlaceOrder} disabled={loading} style={submitBtn}>
                  {loading ? "PROCESSING..." : "PLACE ORDER NOW"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ================= STYLES (LIGHT THEME) =================

const appContainer = { 
  background: "#f8fafc", 
  minHeight: "100vh", 
  width: "100%", 
  display: "flex", 
  flexDirection: "column", 
  fontFamily: "'Inter', sans-serif", 
  color: "#1e293b",
  paddingBottom: "40px"
};

const headerSection = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 30px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const brandGroup = { display: "flex", alignItems: "center", gap: "15px" };
const logoBox = { width: "40px", height: "40px", background: "#1e293b", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center" };
const mainTitle = { fontSize: "18px", margin: 0, fontWeight: "700", color: "#1e293b" };
const subTitle = { fontSize: "10px", color: "#64748b", margin: 0, textTransform: 'uppercase', letterSpacing: '1px' };
const statsContainer = { display: "flex", gap: "20px" };
const statItem = { textAlign: "right" };
const statVal = { display: "block", fontSize: "16px", fontWeight: "700", color: "#d97706" };
const statLab = { fontSize: "9px", color: "#64748b", textTransform: "uppercase" };
const statDivider = { width: "1px", background: "#e2e8f0" };

const contentWrapper = { 
  flex: 1, 
  display: "flex", 
  justifyContent: "center", 
  padding: "30px 20px" 
};

const centerPanel = { width: "100%", maxWidth: "1000px" };
const gridContainer = { display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", alignItems: "start" };

const cardBox = { background: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" };
const sectionHeading = { color: "#1e293b", fontSize: '16px', fontWeight: '800', marginBottom: '15px' };

const cartItemRow = { display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const itemImg = { width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', background: '#e2e8f0' };
const itemName = { fontSize: '13px', fontWeight: 'bold', margin: 0, color: '#1e293b' };
const itemVariant = { fontSize: '10px', color: '#64748b', margin: '2px 0 0 0' };
const itemPrice = { fontSize: '12px', fontWeight: 'bold', color: '#d97706' };

const qtyControlBox = { display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '8px', padding: '2px', border: '1px solid #cbd5e1' };
const qtyBtn = { background: 'none', border: 'none', color: '#1e293b', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const removeBtn = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' };

const labelStyle = { fontSize: '11px', color: '#64748b', marginBottom: '6px', display: 'block', fontWeight: '700', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', background: '#f8fafc', color: '#1e293b', marginBottom: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' };

const locationBtn = { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#d97706', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };
const saveAddressBtn = { background: '#1e293b', border: 'none', color: '#ffffff', width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' };

const summaryRow = { display: 'flex', justifyContent: 'space-between' };
const couponBtn = { background: '#1e293b', border: 'none', color: '#ffffff', padding: '0 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' };
const addressIdBox = { background: '#f8fafc', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const submitBtn = { background: 'linear-gradient(135deg, #fbbf24, #d97706)', padding: '15px', border: 'none', borderRadius: '10px', color: '#ffffff', fontWeight: '900', fontSize: '14px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)' };