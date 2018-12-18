'use strict';

var db = require('../../config/db');
var auth = require('../helpers/auth');
var pwdtools = require('../helpers/password');

module.exports = {
  staffLogin: staffLogin,
  staffAdd: staffAdd,
};


// staff/login
function staffLogin(req, res) {

  let email = req.swagger.params.credentials.value.email;

  var q = db.queryize.select('s.*')
  .from('staff', 's')
  .join('`company`', {alias: 'c', on: 's.CompanyID = c.CompanyID'})
  .join('`group`', {alias: 'g', on: 'c.GroupID = g.GroupID'})
  .where(`s.Email = '${email}'`)
  .where(`s.Active = 1`)
  .where(`c.Active = 1`)
  .where(`g.Active = 1`)
  .compile();
  db.query(q, (error, rows)=>{
    if(error){ 
      res.end(error); 
    } else if(!rows[0]){
      res.status(403).json({message: "Error: Credentials incorrect"});
    } else {

      let data = rows[0];
      let password = req.swagger.params.credentials.value.password;
      let salt = data.PasswordSalt;
      let hash = pwdtools.generateHash(password, salt);
    
      if(data.PasswordHash !== hash){
        return res.status(403).json({message: "Error: Credentials incorrect"});
      }

      let userDetails = {
        Email: data.Email,
        FirstName: data.FirstName,
        LastName: data.LastName,
        StaffID: data.StaffID,
        CompanyID: data.CompanyID,
        GroupID: data.GroupID,
        StaffRoleID: data.StaffRoleID
      }
      let tokenString = auth.issueToken(userDetails, 'admin');
      let response = {token: tokenString}
      res.json(response);
    }
  });
}


// staff/add
function staffAdd(req, res) {

  let email = req.swagger.params.credentials.value.email;
  let password = req.swagger.params.credentials.value.password;
  let salt = pwdtools.generateSalt();
  let hash = pwdtools.generateHash(password, salt);
  //Insert query
}





