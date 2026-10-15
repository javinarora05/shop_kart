const jwt = require("jsonwebtoken");

const generateToken = (customerId) => {
  return jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || "default_shopkart_jwt_secret",
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;
