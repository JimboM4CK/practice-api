'use strict';

//var util = require('util');
var db = require('../../config/db');

module.exports = {
  getServices: getServices,
  getService: getService,
  getServiceCategories: getServiceCategories,
  getServiceCategory: getServiceCategory,
  getServiceCategoryTemplates: getServiceCategoryTemplates,
  getServiceCategoryServices: getServiceCategoryServices,
  getServiceTemplates: getServiceTemplates,
  getServiceTemplate: getServiceTemplate,
  getServiceTemplateServices: getServiceTemplateServices
};


// services
function getServices(req, res) {
  var q = db.queryize.select('s.*')
  .from('service', 's')
  .where(`s.Active = 1`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

// services/:id
function getService(req, res) {
  var q = db.queryize.select('s.*')
  .from('service', 's')
  .where(`s.ServiceID = ${req.swagger.params.id.value}`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

// services/categories
function getServiceCategories(req, res) {
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
function getServiceCategory(req, res) {
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


// services/categories/:id/templates
function getServiceCategoryTemplates(req, res) {
  var q = db.queryize.select('st.*')
  .from('service_template', 'st')
  .join('service_category', {alias: 'sc', on: 'st.ServiceCategoryID = sc.ServiceCategoryID'})
  .where(`sc.ServiceCategoryID = ${req.swagger.params.id.value}`)
  .where(`sc.Active = 1`)
  .where(`st.Active = 1`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}


// services/categories/:id/services
function getServiceCategoryServices(req, res) {
  var q = db.queryize.select('s.*')
  .from('service', 's')
  .join('service_template', {alias: 'st', on: 's.ServiceTemplateID = st.ServiceTemplateID'})
  .join('service_category', {alias: 'sc', on: 'st.ServiceCategoryID = sc.ServiceCategoryID'})
  .where(`sc.ServiceCategoryID = ${req.swagger.params.id.value}`)
  .where(`sc.Active = 1`)
  .where(`st.Active = 1`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}


// services/templates
function getServiceTemplates(req, res) {
  var q = db.queryize.select('st.*')
  .from('service_template', 'st')
  .where({'st.Active':'1'})
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

// services/templates/:id
function getServiceTemplate(req, res) {
  var q = db.queryize.select('st.*')
  .from('service_template', 'st')
  .where(`st.ServiceTemplateID = ${req.swagger.params.id.value}`)
  .where(`st.Active=1`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

// services/templates/:id/services
function getServiceTemplateServices(req, res) {
  var q = db.queryize.select('s.*')
  .from('service', 's')
  .join('service_template', {alias: 'st', on: 's.ServiceTemplateID = st.ServiceTemplateID'})
  .where(`s.ServiceTemplateID = ${req.swagger.params.id.value}`)
  .where(`st.Active=1`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

