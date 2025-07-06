const Order = require("../models/orderModel");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const normalizeEmail = require("../utils/emailNormalizer");

class OrderController {
  /**
   * Create a new order
   */
  static async createOrder(req, res) {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const orderData = req.body;

      // If createdAt is provided in request, use it (for testing/mocking)
      if (orderData.createdAt) {
        orderData.createdAt = new Date(orderData.createdAt);
      }

      const order = new Order(orderData);
      const savedOrder = await order.save();

      res.status(201).json(savedOrder);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          details: error.message,
        });
      }
      console.error("Error creating order:", error);
      res.status(500).json({
        error: "Failed to create order",
        details: error.message,
      });
    }
  }

  /**
   * Get all orders with filtering, sorting and pagination
   */
  static async getAllOrders(req, res) {
    try {
      const { role, storeId } = req.user;
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

      // Validate pagination parameters
      const parsedPage = Math.max(1, parseInt(page));
      const parsedLimit = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100 items per page
      const skip = (parsedPage - 1) * parsedLimit;

      // Build base query
      let query = {};

      // Role-based filtering
      if (role === "admin") {
        // Admin sees all orders - no additional filter needed
      } else if (role === "manager" || role === "user") {
        if (!storeId) {
          return res.status(400).json({
            success: false,
            message: "Store ID missing in user context",
          });
        }
        // STRICT STORE FILTERING - Only show orders from user's assigned store
        query.storeId = new mongoose.Types.ObjectId(storeId);

        // For regular users, also filter by their email
        if (role === "user") {
          query["billingInfo.email"] = req.user.email;
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Unauthorized role",
        });
      }

      // Additional filters
      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Execute query with pagination
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate({
            path: "storeId",
            select: "name address phone",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
          .lean(),
        Order.countDocuments(query),
      ]);

      // DEBUG: Log the query and user info
      console.log("Query:", query);
      console.log("User:", { role, storeId: req.user.storeId });

      return res.status(200).json({
        success: true,
        data: orders,
        pagination: {
          total,
          page: parsedPage,
          pages: Math.ceil(total / parsedLimit),
          limit: parsedLimit,
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);

      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format or date",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  /**
   * Get order by ID
   */
  static async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({ error: "Invalid order ID" });
      }
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  }

  /**
   * Update order by ID
   */
  static async updateOrder(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updateData = req.body;

      // Prevent updating certain fields
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.orderTotal; // Should be calculated from cart items

      const order = await Order.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation Error",
          details: error.message,
        });
      }
      console.error("Error updating order:", error);
      res.status(500).json({
        error: "Failed to update order",
        details: error.message,
      });
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !["pending", "confirmed", "cancelled", "completed"].includes(status)
      ) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }

  /**
   * Delete order by ID
   */
  static async deleteOrder(req, res) {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  }

  /**
   * Get customer's order history by email
   */
  static async getCustomerOrders(req, res) {
    try {
      const { email } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const normalizedEmail = normalizeEmail(email);

      const orders = await Order.find({
        "billingInfo.email": normalizedEmail,
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Order.countDocuments({
        "billingInfo.email": normalizedEmail,
      });

      res.json({
        data: orders,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Failed to fetch customer orders" });
    }
  }
}

module.exports = OrderController;
