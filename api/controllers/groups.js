'use strict';
//var util = require('util');
var db = require('../../config/db');
var misc =  require('../helpers/misc');
module.exports = {
  getGroup: getGroup,
  getGroupCompanies: getGroupCompanies
};


// groups/:id
function getGroup(req, res) {
  let userData = misc.getUserDataJWT(req);
  var q = db.queryize.select('g.*')
  .from('group', 'g')
  .where(`g.GroupID = ${req.swagger.params.id.value}`)
  .where(`g.GroupID = ${userData.GroupID}`) //make sure they have access to this group
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.json(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

// groups/:id/companies
function getGroupCompanies(req, res) {
  let userData = misc.getUserDataJWT(req);
  var q = db.queryize.select('c.*')
  .from('company', 'c')
  .where(`c.Active = 1`)
  .where(`c.GroupID = ${req.swagger.params.id.value}`)
  .where(`c.GroupID = ${userData.GroupID}`)
  .compile();
  
  db.query(q, (error, rows)=>{
    if(error){ res.json(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}