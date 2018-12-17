'use strict';

var db = require('../../config/db');
var auth = require('../helpers/auth');

module.exports = {
  loginUser: loginUser,
};


// login
function loginUser(req, res) {
  var q = db.queryize.select()
  .from('staff', 's')
  .join('`company`', {alias: 'c', on: 's.CompanyID = c.CompanyID'})
  .join('`group`', {alias: 'g', on: 'c.GroupID = g.GroupID'})
  .where(`s.Email = '${req.swagger.params.credentials.value.email}'`)
  .where(`s.Password = '${req.swagger.params.credentials.value.password}'`)
  .where(`s.Active = 1`)
  .where(`c.Active = 1`)
  .where(`g.Active = 1`)
  .compile();
  db.query(q, (error, rows)=>{

    if(error){ 
      res.end(error); 
    } else if(!rows[0]){
      res.json(403, {message: "Error: Credentials incorrect"});
    } else { 
      var tokenString = auth.issueToken(rows[0], 'admin');
      var response = {token: tokenString}
      res.json(response);
    }
  });
}
