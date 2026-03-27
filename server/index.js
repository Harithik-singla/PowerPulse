const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const outageRoutes = require('./routes/outage.routes');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/outages', outageRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));