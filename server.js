'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = app; // For FCC testing
