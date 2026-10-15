import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const data = await getMyOrders();

        setOrders(data.orders || []);
      } catch (err) {
        console.error("Get orders error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your orders",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2>No orders yet</h2>

        <p className="text-muted">
          You haven't placed any orders yet.
        </p>

        <Link to="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order._id}
          className="card mb-3"
        >
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="card-title">
                  Order #{order._id}
                </h5>

                <p className="mb-1">
                  <strong>Status:</strong>{" "}
                  {order.status}
                </p>

                <p className="mb-1">
                  <strong>Payment:</strong>{" "}
                  {order.paymentStatus}
                </p>

                <p className="mb-0">
                  <strong>Total:</strong> ₹
                  {order.totalAmount}
                </p>
              </div>

              <Link
                to={`/orders/${order._id}`}
                className="btn btn-outline-primary"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;