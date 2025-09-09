const express = require('express');
const app = express();
app.use(express.json());
const apiRoutes = require('./routes/api'); // adjust path as needed
app.use('/api', apiRoutes);
module.exports = app;
