import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const data = await getOrderById(id);

        setOrder(data.order);
      } catch (err) {
        console.error("Get order details error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load order details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>

        <Link to="/orders" className="btn btn-primary">
          Back to My Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>

        <Link to="/orders" className="btn btn-outline-secondary">
          Back to Orders
        </Link>
      </div>

      {/* Order information */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Order Information</h5>

          <p className="mb-1">
            <strong>Order ID:</strong> {order._id}
          </p>

          <p className="mb-1">
            <strong>Order Status:</strong> {order.status}
          </p>

          <p className="mb-1">
            <strong>Payment Status:</strong>{" "}
            {order.paymentStatus}
          </p>

          <p className="mb-0">
            <strong>Total:</strong> ₹{order.totalAmount}
          </p>
        </div>
      </div>

      {/* Shipping address */}
      <div className="card mb-4">
        <div className="card-body">
          <h5>Shipping Address</h5>

          <p className="mb-1">
            {order.shippingAddress.fullName}
          </p>

          <p className="mb-1">
            {order.shippingAddress.phone}
          </p>

          <p className="mb-1">
            {order.shippingAddress.addressLine1}
          </p>

          <p className="mb-0">
            {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} -{" "}
            {order.shippingAddress.pincode}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Items</h5>

          {order.items.map((item) => (
            <div
              key={item.product}
              className="d-flex justify-content-between align-items-center border-bottom py-3"
            >
              <div>
                <h6 className="mb-1">{item.name}</h6>

                <p className="mb-0 text-muted">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>

              <strong>
                ₹{item.price * item.quantity}
              </strong>
            </div>
          ))}

          <div className="text-end mt-3">
            <h5>
              Total: ₹{order.totalAmount}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;