const express = require("express");
const dotenv = require("dotenv");
const specialRoutes = require("./src/routes/specialRoutes");
const menuItemRoutes = require("./src/routes/menuItemRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const nearestStore = require("./src/routes/nearestLocation");
const ordersRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
dotenv.config();

const app = express();

// 🟢 Add CORS middleware
const cors = require('cors');
app.use(cors());

// 🟢 Body parsing middleware (optional, if you’re using JSON)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 🟢 API routes
app.use("/api/specials", specialRoutes);
app.use('/api/menuitems', menuItemRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/location", nearestStore);
app.use("/api/orders", ordersRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/category", categoryRoutes);


app.get('/api/startup-check', (req, res) => {
  res.status(200).json({ message: 'API is running' });
})
// 🟢 Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
