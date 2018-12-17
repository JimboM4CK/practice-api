'use strict';

//var util = require('util');
var db = require('../../config/db');

module.exports = {
  servicesCategories: servicesCategories,
  servicesCategoriesById: servicesCategoriesById
};

// services/categories
function servicesCategories(req, res) {
  var q = db.queryize.select('sc.*')
  .from('service_category', 'sc')
  .where(`sc.Active = 1`)
  .compile();
  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

// services/categories/:id/
function servicesCategoriesById(req, res) {

  var q = db.queryize.select('sc.*')
  .from('service_category', 'sc')
  .where(`sc.ServiceCategoryID = ${req.swagger.params.id.value}`)
  .compile();
  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

  /*
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var name = req.swagger.params.name.value || 'stranger';
  var hello = util.format('Hello, %s!', name);

  // this sends back a JSON response which is a single string
  res.json(hello);
  */
