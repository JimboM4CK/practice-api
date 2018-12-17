const mysql = require('../db');
const express = require('express');
const app = module.exports = express();

app.get('/api/services/categories', (req, res) => {
  var q = mysql.queryize.select('sc.*')
  .from('service_category', 'sc')
  .where(`sc.Active = 1`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services/categories/:id', (req, res) => {
  var q = mysql.queryize.select('sc.*')
  .from('service_category', 'sc')
  .where(`sc.ServiceCategoryID = ${req.params.id}`)
  .where(`sc.Active = 1`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services/categories/:id/templates', (req, res) => {
  var q = mysql.queryize.select('st.*')
  .from('service_template', 'st')
  .join('service_category', {alias: 'sc', on: 'st.ServiceCategoryID = sc.ServiceCategoryID'})
  .where(`sc.ServiceCategoryID = ${req.params.id}`)
  .where(`sc.Active = 1`)
  .where(`st.Active = 1`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services/categories/:id/services', (req, res) => {
  var q = mysql.queryize.select('s.*')
  .from('service', 's')
  .join('service_template', {alias: 'st', on: 's.ServiceTemplateID = st.ServiceTemplateID'})
  .join('service_category', {alias: 'sc', on: 'st.ServiceCategoryID = sc.ServiceCategoryID'})
  .where(`sc.ServiceCategoryID = ${req.params.id}`)
  .where(`sc.Active = 1`)
  .where(`st.Active = 1`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services/templates', (req, res) => {
  var q = mysql.queryize.select('st.*')
  .from('service_template', 'st')
  .where({'st.Active':'1'})
  .compile();
  mysql.query(q, (rows) => {
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services/templates/:id', (req, res) => {
  var q = mysql.queryize.select('st.*')
  .from('service_template', 'st')
  .where(`st.ServiceTemplateID = ${req.params.id}`)
  .where(`st.Active=1`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services/templates/:id/services', (req, res) => {
  var q = mysql.queryize.select('s.*')
  .from('service', 's')
  .join('service_template', {alias: 'st', on: 's.ServiceTemplateID = st.ServiceTemplateID'})
  .where(`s.ServiceTemplateID = ${req.params.id}`)
  .where(`st.Active=1`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services', (req, res) => {
  var q = mysql.queryize.select('s.*')
  .from('service', 's')
  .where(`s.Active = 1`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});

app.get('/api/services/:id', (req, res) => {
  var q = mysql.queryize.select('s.*')
  .from('service', 's')
  .where(`s.ServiceID = ${req.params.id}`)
  .compile();
  mysql.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
});
