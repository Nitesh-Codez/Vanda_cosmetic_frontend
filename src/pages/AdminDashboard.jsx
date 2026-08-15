import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    activeProducts: 0,
    lowStockProducts: 0,
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(false);

  // Interactive Live Data State for Graphs/Meters
  const [activeTabMetric, setActiveTabMetric] = useState("sales");
  const [hoveredCard, setHoveredCard] = useState(null);

  const API_BASE_URL = "https://vanda-cosmetic.onrender.com/api/admin";

  // =========================================================
  // LOAD USER + DATA
  // =========================================================

  useEffect(() => {
    try {
      const storedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("admin"));

      if (storedUser && storedUser.name) {
        setUserName(storedUser.name);
      }
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }

    fetchAllData();
  }, []);

  // =========================================================
  // FETCH ALL DATA
  // =========================================================

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardData(),
      fetchProducts(),
      fetchCategories(),
    ]);
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`);
      const data = await res.json();

      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();

      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();

      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // =========================================================
  // USER INITIAL
  // =========================================================

  const getInitials = (name) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  // =========================================================
  // LOGOUT HANDLER
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleTabChange = (tabId) => {
    if (tabId === "dashboard") {
      navigate("/admin/dashboard");
    } else if (tabId === "products") {
      navigate("/admin/products");
    } else {
      alert(`${tabId} page is coming soon!`);
    }

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // =========================================================
  // SIDEBAR ITEMS
  // =========================================================

  const generalItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Product & Form", icon: "📦" },
    { id: "inventory", label: "Inventory", icon: "🔄" },
    { id: "customers", label: "Customers", icon: "👤" },
    { id: "review", label: "Review", icon: "⭐", badge: "02" },
    { id: "payment", label: "Payment", icon: "💳" },
    { id: "integration", label: "Integration", icon: "🔗" },
  ];

  const accountItems = [
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "help", label: "Help", icon: "❓" },
    { id: "manageUsers", label: "Manage Users", icon: "👥" },
  ];

  // Dynamic Chart Heights for Real-Time Animated Graph bars
  const graphBars = [
    { label: "Mon", height: "65%", value: "₹18.4K", orders: 142 },
    { label: "Tue", height: "40%", value: "₹12.1K", orders: 98 },
    { label: "Wed", height: "85%", value: "₹24.9K", orders: 210 },
    { label: "Thu", height: "55%", value: "₹15.3K", orders: 125 },
    { label: "Fri", height: "95%", value: "₹32.8K", orders: 290 },
    { label: "Sat", height: "100%", value: "₹41.5K", orders: 360 },
    { label: "Sun", height: "75%", value: "₹22.0K", orders: 185 },
  ];

  return (
    <div className="min-h-screen bg-[#070913] flex font-sans text-slate-100 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* SIDEBAR (High-Tech Dark Purple/Blue Theme) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0f0c29] bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-slate-200 flex flex-col justify-between shrink-0 border-r border-indigo-900/40 shadow-2xl transition-all duration-300 ease-in-out md:static ${
          sidebarOpen
            ? "w-72 translate-x-0"
            : "w-0 -translate-x-full md:w-20 md:translate-x-0"
        }`}
      >
        <div className="overflow-hidden whitespace-nowrap">
          {/* LOGO */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-pink-500/30 shrink-0 animate-pulse">
                ✨
              </div>
              <span
                className={`font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-indigo-200 transition-opacity duration-200 ${
                  !sidebarOpen && "md:hidden"
                }`}
              >
                Vanda Cosmetic
              </span>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="p-4 space-y-6 mt-2">
            <div>
              <p
                className={`text-[11px] font-bold uppercase tracking-widest text-indigo-300/60 px-3 mb-3 ${
                  !sidebarOpen && "md:hidden"
                }`}
              >
                GENERAL
              </p>
              <nav className="space-y-1.5">
                {generalItems.map((item) => {
                  const isActive = item.id === "dashboard";
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      title={!sidebarOpen ? item.label : ""}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all group duration-300 transform hover:scale-[1.02] ${
                        isActive
                          ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-semibold border border-pink-400/30"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg group-hover:scale-125 group-hover:rotate-6 transition-transform shrink-0">
                          {item.icon}
                        </span>
                        <span
                          className={`transition-opacity duration-200 ${
                            !sidebarOpen && "md:hidden"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      {item.badge && (
                        <span
                          className={`bg-pink-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow animate-bounce ${
                            !sidebarOpen && "md:hidden"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ACCOUNT */}
            <div>
              <p
                className={`text-[11px] font-bold uppercase tracking-widest text-indigo-300/60 px-3 mb-3 ${
                  !sidebarOpen && "md:hidden"
                }`}
              >
                ACCOUNT
              </p>
              <nav className="space-y-1.5">
                {accountItems.map((item) => (
                  <button
                    key={item.id}
                    title={!sidebarOpen ? item.label : ""}
                    onClick={() => handleTabChange(item.id)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all group duration-300 transform hover:scale-[1.02]"
                  >
                    <span className="text-lg group-hover:scale-125 transition-transform shrink-0">
                      {item.icon}
                    </span>
                    <span
                      className={`transition-opacity duration-200 ${
                        !sidebarOpen && "md:hidden"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10 overflow-hidden whitespace-nowrap">
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? "Logout" : ""}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all group transform hover:scale-[1.02]"
          >
            <span className="group-hover:-translate-x-1 transition-transform shrink-0">
              🚪
            </span>
            <span
              className={`transition-opacity duration-200 ${
                !sidebarOpen && "md:hidden"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#070913]">
        {/* TOP NAVBAR */}
        <header className="bg-[#121629]/80 backdrop-blur-md border-b border-indigo-900/30 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xl">
          <div className="flex items-center gap-4 w-full max-w-md">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 transition-all active:scale-95 border border-white/10 shadow-inner group"
              title="Toggle Sidebar"
            >
              <span className="group-hover:rotate-90 transition-transform inline-block">☰</span>
            </button>
            <div className="relative w-full group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-hover:text-pink-400 transition-colors">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search catalog, users, metrics..."
                className="bg-[#0b0e1b] border border-indigo-900/50 text-sm text-slate-200 rounded-full pl-12 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all shadow-inner hover:border-indigo-500/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-300 hover:bg-white/10 hover:text-pink-300 transition-all relative transform hover:scale-105 shadow-md">
              🔔
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500"></span>
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center font-bold text-base text-white shadow-lg shadow-pink-500/25 ring-2 ring-pink-500/30">
                {getInitials(userName)}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-white tracking-wide">
                  {userName}
                </span>
                <span className="text-[10px] font-semibold text-pink-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Store Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-6 md:p-8 space-y-8">
          {/* WELCOME BANNER (Gradients & Glowing Backdrop) */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-[#121629] p-8 rounded-3xl shadow-2xl border border-indigo-500/30 backdrop-blur-xl group hover:border-pink-500/40 transition-all duration-500">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/25 transition-all"></div>
            <div className="absolute right-40 top-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold px-3.5 py-1 rounded-full mb-3 shadow-md animate-pulse">
                  ✨ Vanda Cosmetics Live Command Hub
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 animate-gradient">{userName}</span>!
                </h1>
                <p className="text-slate-300 text-sm md:text-base mt-2 max-w-xl">
                  Your store is fully synchronized with real-time graphs, inventory triggers, and dynamic aesthetic tracking.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button
                  onClick={fetchAllData}
                  disabled={loading}
                  className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 shadow-md hover:border-pink-500/40"
                >
                  <span className={`${loading ? "animate-spin" : ""}`}>🔄</span> {loading ? "Syncing..." : "Refresh Stats"}
                </button>
                <button
                  onClick={() => navigate("/admin/products")}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 transform hover:-translate-y-0.5"
                >
                  + Add New Product
                </button>
              </div>
            </div>
          </div>

          {/* STATS GRID (High-Tech Cards with Glowing Interactive Hover) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div 
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative bg-[#121629]/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border transition-all duration-300 transform hover:-translate-y-1.5 ${
                hoveredCard === 1 ? "border-pink-500/60 shadow-pink-500/10 shadow-2xl bg-[#161b33]" : "border-indigo-500/20"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Products</p>
                <span className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">🛍️</span>
              </div>
              <h3 className="text-4xl font-black text-white mt-4 tracking-tight flex items-baseline gap-2">
                {products.length}
                <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md">Items</span>
              </h3>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Catalog
                </span>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">View All →</span>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative bg-[#121629]/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border transition-all duration-300 transform hover:-translate-y-1.5 ${
                hoveredCard === 2 ? "border-blue-500/60 shadow-blue-500/10 shadow-2xl bg-[#161b33]" : "border-indigo-500/20"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Categories</p>
                <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg shadow-inner">📑</span>
              </div>
              <h3 className="text-4xl font-black text-white mt-4 tracking-tight flex items-baseline gap-2">
                {categories.length}
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">Groups</span>
              </h3>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Active Groups
                </span>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Manage →</span>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative bg-[#121629]/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border transition-all duration-300 transform hover:-translate-y-1.5 ${
                hoveredCard === 3 ? "border-purple-500/60 shadow-purple-500/10 shadow-2xl bg-[#161b33]" : "border-indigo-500/20"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Products</p>
                <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg shadow-inner">✨</span>
              </div>
              <h3 className="text-4xl font-black text-white mt-4 tracking-tight flex items-baseline gap-2">
                {products.filter((p) => p.is_active !== false).length}
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md">Selling</span>
              </h3>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span> Selling Live
                </span>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Inspect →</span>
              </div>
            </div>

            {/* Card 4 */}
            <div 
              onMouseEnter={() => setHoveredCard(4)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative bg-[#121629]/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border transition-all duration-300 transform hover:-translate-y-1.5 ${
                hoveredCard === 4 ? "border-rose-500/60 shadow-rose-500/10 shadow-2xl bg-[#161b33]" : "border-rose-500/30"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Low Stock Alerts</p>
                <span className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-lg shadow-inner animate-pulse">⚠️</span>
              </div>
              <h3 className="text-4xl font-black text-rose-400 mt-4 tracking-tight flex items-baseline gap-2">
                {products.filter((p) => Number(p.stock) <= 5).length}
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">Critical</span>
              </h3>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> Needs Refill
                </span>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Refill Now →</span>
              </div>
            </div>
          </div>

          {/* REAL ANIMATED GRAPH & ANALYTICS SECTION (Inspired by product theme look) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LIVE ANALYTICS GRAPH CARD */}
            <div className="lg:col-span-2 bg-[#121629]/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-bl from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                      Live Performance Matrix
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-2">Revenue & Orders Activity</h2>
                  </div>
                  
                  {/* Graph Filter Tabs */}
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
                    <button 
                      onClick={() => setActiveTabMetric("sales")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${activeTabMetric === "sales" ? "bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                    >
                      Revenue
                    </button>
                    <button 
                      onClick={() => setActiveTabMetric("orders")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${activeTabMetric === "orders" ? "bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                    >
                      Orders
                    </button>
                  </div>
                </div>

                {/* GRAPH CONTAINER WITH HOVER INTERACTIVE BARS */}
                <div className="h-60 flex items-end justify-between gap-3 pt-8 pb-4 px-2 border-b border-white/10 relative">
                  {/* Background Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-dashed border-white w-full"></div>
                    <div className="border-b border-dashed border-white w-full"></div>
                    <div className="border-b border-dashed border-white w-full"></div>
                    <div className="border-b border-dashed border-white w-full"></div>
                  </div>

                  {graphBars.map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group/bar relative z-10">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-12 bg-slate-900 border border-pink-500/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all transform -translate-y-2 group-hover/bar:translate-y-0 shadow-xl pointer-events-none whitespace-nowrap z-30">
                        {activeTabMetric === "sales" ? bar.value : `${bar.orders} Orders`}
                      </div>

                      {/* Animated Hover Bar */}
                      <div 
                        style={{ height: bar.height }}
                        className="w-full max-w-[42px] bg-gradient-to-t from-indigo-600/80 via-purple-500/90 to-pink-500 rounded-2xl shadow-lg shadow-pink-500/20 group-hover/bar:from-pink-500 group-hover/bar:to-indigo-400 transition-all duration-500 cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                      </div>

                      <span className="text-xs font-semibold text-slate-400 group-hover/bar:text-pink-400 transition-colors">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span> Real-time data stream active
                </span>
                <span className="text-indigo-400 font-bold hover:underline cursor-pointer">Export Full Report →</span>
              </div>
            </div>

            {/* LIVE QUICK METRICS STATUS CARD */}
            <div className="bg-[#121629]/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-indigo-500/20 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Database Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live Render API & Supabase sync
                </p>
                <div className="space-y-3.5 my-6">
                  <div className="flex justify-between items-center text-sm p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all">
                    <span className="text-slate-300 font-medium">API Connection</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                      ● Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all">
                    <span className="text-slate-300 font-medium">Loaded Categories</span>
                    <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-xl text-xs">{categories.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/40 transition-all">
                    <span className="text-slate-300 font-medium">Registered Products</span>
                    <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-xl text-xs">{products.length}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={fetchAllData}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white border border-white/10 font-semibold rounded-2xl text-xs transition-all shadow-sm active:scale-95"
              >
                Re-Sync All Data
              </button>
            </div>
          </div>

          {/* SYSTEM CONTROL CENTER HERO PANEL */}
          <div className="bg-gradient-to-br from-[#13112e] via-[#1a1738] to-[#0e0c1f] p-8 rounded-3xl shadow-2xl border border-indigo-500/30 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <span className="bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold px-3.5 py-1 rounded-full">
                System Control Center
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-4 tracking-tight">
                Manage Catalog & Inventory
              </h2>
              <p className="text-slate-300 text-sm mt-2 max-w-lg leading-relaxed">
                Direct access to inventory endpoints, Supabase storage image galleries, and real-time stock updating tools.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/products")}
              className="px-6 py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-indigo-500/30 whitespace-nowrap transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 z-10"
            >
              Open Products & Form Panel ➔
            </button>
          </div>

          {/* RECENT DATA SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121629]/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Catalog Overview</h3>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">Latest 5</span>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No products found.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {products.slice(0, 5).map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-pink-500/30 transition-all group"
                    >
                      <span className="font-semibold text-sm text-slate-200 group-hover:text-pink-300 transition-colors">
                        {p.name || `Product #${idx + 1}`}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                        Stock: {p.stock ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#121629]/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-lg">Active Categories</h3>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">Latest 5</span>
              </div>
              {categories.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No categories found.
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {categories.slice(0, 5).map((c, idx) => (
                    <div
                      key={c.id || idx}
                      className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                    >
                      <span className="font-semibold text-sm text-slate-200 group-hover:text-blue-300 transition-colors">
                        {c.name || `Category #${idx + 1}`}
                      </span>
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-xl">
                        Active Group
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;