const express = require('express');
const app = module.exports = express();

var routes = {
  services: require('./routes/services')
}

app.use('/public', express.static('public'))

app.use(routes.services);
