const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: [true, "Password is required"],
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },

  wishlist: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    default: [],
  },

  cart : {
    type : [
      {
        product: {
          type : mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number ,
          default: 1 , 
          min : 1 ,
        }
      }
    ], 
    default: []

  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Customer", customerSchema);