const config = require('./config');
const express = require('express');
const app = express();

const routes = require('./routes.js');

app.use(routes);
app.listen(config.app_port);
