require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Server error' });
});

async function start() {
  const port = process.env.PORT || 4000;
  await connectDB(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`Server running on ${port}`));
}

if (require.main === module) {
  start();
}

module.exports = app;
