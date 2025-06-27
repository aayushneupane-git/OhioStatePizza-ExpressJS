const app = require('./app');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv');

// Determine current environment (default to development)
const env = process.env.NODE_ENV || 'development';

// Load the appropriate .env file
dotenv.config({ path: `.env.${env}` });

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env} mode on port ${PORT}`);
});
