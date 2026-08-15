import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function MyOrders() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser ? storedUser.id : 1;

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch Profile
        const profileRes = await API.get(`/profile/${userId}`);
        setProfile(profileRes.data.user);

        // Fetch Orders
        const ordersRes = await API.get(`/orders/${userId}`);
        setOrders(ordersRes.data.orders);
      } catch (err) {
        console.error("Error fetching profile/orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <div className="text-center py-12 text-gray-600">Loading user profile and orders...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Profile Info */}
      {profile && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-2xl font-bold rounded-full">
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-600">{profile.email} | {profile.phone || "No phone provided"}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              Role: {profile.role}
            </span>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">My Orders History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found for this user.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center border-b pb-3 text-sm">
                  <div>
                    <span className="font-bold text-gray-700">Order ID: </span>{order.order_number}
                    <span className="ml-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold text-xs">
                    {order.order_status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">{item.product_name} (x{item.quantity})</span>
                      <span className="font-semibold text-gray-900">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-3 font-bold text-base">
                  <span className="text-gray-600">Total Amount ({order.payment_method}):</span>
                  <span className="text-blue-600">₹{order.final_amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}