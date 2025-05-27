const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/userRoutes')
const specialRoutes = require('./src/routes/specialRoutes');
const menuItemRoutes = require('./src/routes/menuItemRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/specials', specialRoutes);
app.use('/api/menu', menuItemRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
