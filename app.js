const express = require("express");
const dotenv = require("dotenv");
const specialRoutes = require("./src/routes/specialRoutes");
const menuItemRoutes = require("./src/routes/menuItemRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");

dotenv.config();

const app = express();

// 🟢 Add CORS middleware
const cors = require('cors');
app.use(cors());

// 🟢 Body parsing middleware (optional, if you’re using JSON)
app.use(express.json());

// 🟢 API routes
app.use("/api/specials", specialRoutes);
app.use('/api/menuitems', menuItemRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/employees", employeeRoutes);

// 🟢 Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
