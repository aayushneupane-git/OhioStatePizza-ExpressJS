const express = require("express");
const dotenv = require("dotenv");
const specialRoutes = require("./src/routes/specialRoutes");
const menuItemRoutes = require("./src/routes/menuItemRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/specials", specialRoutes);
app.use('/api/menuitems', menuItemRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/employees", employeeRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
