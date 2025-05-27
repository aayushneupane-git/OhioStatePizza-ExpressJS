const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/userRoutes')
const specialRoutes = require('./src/routes/specialRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/specials', specialRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
