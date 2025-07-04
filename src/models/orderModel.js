const mongoose = require("mongoose");
const { Schema } = mongoose;


const cartItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    description: { type: String },
    selectedOptions: { type: Map, of: Schema.Types.Mixed },
  },
  { _id: false }
);

const billingInfoSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
  },
  { _id: false }
);

const carryoutInfoSchema = new Schema(
  {
    timeOption: {
      type: String,
      required: true,
      enum: {
        values: ["asap", "scheduled"],
        message: "{VALUE} is not supported",
      },
      default: "asap",
    },
    scheduledTime: {
      type: String,
      validate: {
        validator: function (v) {
          if (this.timeOption === "scheduled") {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          }
          return true;
        },
        message: (props) =>
          `Scheduled time must be in HH:MM format when timeOption is 'scheduled'`,
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
  },
  { _id: false }
);

const paymentInfoSchema = new Schema(
  {
    method: {
      type: String,
      required: [true, "Payment method is required"],
      trim: true,
    },
    last4: {
      type: String,
      validate: {
        validator: function (v) {
          if (v) return /^\d{4}$/.test(v);
          return true;
        },
        message: (props) => `Last 4 digits must be exactly 4 numbers`,
      },
    },
  },
  { _id: false }
);
const orderSchema = new Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    billingInfo: { type: billingInfoSchema, required: true },
    carryoutInfo: { type: carryoutInfoSchema, required: true },
    serviceType: String,
    cartItems: {
      type: [cartItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one cart item is required",
      },
    },
    paymentInfo: { type: paymentInfoSchema, required: true },
    orderTotal: {
      type: Number,
      required: [true, "Order total is required"],
      min: [0, "Order total cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "cooking", "cancelled", "delivery", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ "billingInfo.email": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save hook to validate orderTotal matches sum of cart items
orderSchema.pre("save", function (next) {
  if (this.isModified("cartItems") || this.isNew) {
    const calculatedTotal = this.cartItems.reduce(
      (sum, item) => sum + item.totalPrice * item.quantity,
      0
    );

    // if (Math.abs(calculatedTotal - this.orderTotal) > 0.01) {
    //   const err = new Error('Order total does not match sum of cart items');
    //   err.name = 'ValidationError';
    //   return next(err);
    // }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
