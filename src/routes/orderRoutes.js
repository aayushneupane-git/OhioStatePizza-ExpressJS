const express = require("express");
const router = express.Router();
const OrderController = require("../controller/orderController");
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderId,
  validateEmail,
  validatePagination,
} = require("../middleware/orderValidation");

// Create a new order
router.post("/", OrderController.createOrder);

// Get all orders with filtering and pagination
router.get("/", validatePagination, OrderController.getAllOrders);

// Get order by ID
router.get("/:id", validateOrderId, OrderController.getOrderById);

// Update order by ID
router.put(
  "/:id",
  validateOrderId,
  validateUpdateOrder,
  OrderController.updateOrder
);

// Update order status
router.patch("/:id/status", validateOrderId, OrderController.updateOrderStatus);

// Delete order by ID
router.delete("/:id", validateOrderId, OrderController.deleteOrder);

// Get customer's order history by email
router.get(
  "/customer/:email",
  validateEmail,
  validatePagination,
  OrderController.getCustomerOrders
);

module.exports = router;
