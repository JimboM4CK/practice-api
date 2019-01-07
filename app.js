'use strict';


var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var cors = require('cors');
var auth = require('./api/helpers/auth');
module.exports = app; // for testing

var config = {
  appRoot: __dirname,
  swaggerSecurityHandlers: {
    Bearer: auth.verifyToken
  }
};

app.use(cors());

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);


  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/login']) {
    console.log('try this as a post request:\ncurl http://127.0.0.1:' + port + '/login');
  }
});
