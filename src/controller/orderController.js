const Order = require('../models/orderModel');
const { validationResult } = require('express-validator');

class OrderController {
  /**
   * Create a new order
   */
  static async createOrder(req, res) {
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
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.message
        });
      }
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: 'Failed to create order',
        details: error.message 
      });
    }
  }

  /**
   * Get all orders with filtering, sorting and pagination
   */
  static async getAllOrders(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        email,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (email) filter['billingInfo.email'] = email.toLowerCase();

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const orders = await Order.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(filter);

      res.json({
        data: orders,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
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
        runValidators: true
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.message
        });
      }
      console.error('Error updating order:', error);
      res.status(500).json({ 
        error: 'Failed to update order',
        details: error.message 
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

      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  /**
   * Delete order by ID
   */
  static async deleteOrder(req, res) {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  }

  /**
   * Get customer's order history by email
   */
  static async getCustomerOrders(req, res) {
    try {
      const { email } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const orders = await Order.find({ 'billingInfo.email': email.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Order.countDocuments({ 'billingInfo.email': email.toLowerCase() });

      res.json({
        data: orders,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ error: 'Failed to fetch customer orders' });
    }
  }
}

module.exports = OrderController;