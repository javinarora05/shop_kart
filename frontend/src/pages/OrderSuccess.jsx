import { Link, useParams } from "react-router-dom";

const OrderSuccess = () => {
  const { id } = useParams();

  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className="text-success mb-3">
          Order Placed Successfully! 🎉
        </h1>

        <p className="lead">
          Thank you for shopping with ShopKart.
        </p>

        <p>
          Your order ID is:
          <strong className="ms-2">{id}</strong>
        </p>

        <div className="mt-4">
          <Link to="/orders" className="btn btn-primary me-2">
            View My Orders
          </Link>

          <Link to="/" className="btn btn-outline-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;