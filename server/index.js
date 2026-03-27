const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const morgan     = require('morgan');
require('dotenv').config();

const connectDB       = require('./config/db');
const { initSocket }  = require('./config/socket');
const authRoutes      = require('./routes/auth.routes');
const outageRoutes    = require('./routes/outage.routes');

connectDB();

const app    = express();
const server = http.createServer(app);     // ← wrap express in http server
initSocket(server);                         // ← attach socket.io

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',    authRoutes);
app.use('/api/outages', outageRoutes);
app.get('/api/health',  (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));