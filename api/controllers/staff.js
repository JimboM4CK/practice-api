'use strict';

var db = require('../../config/db');
var auth = require('../helpers/auth');
var pwdtools = require('../helpers/password');
var misc = require('../helpers/misc');

module.exports = {
  staffLogin: staffLogin,
  staffAdd: staffAdd
};


// staff/login
async function staffLogin(req, res) {

  let email = req.swagger.params.credentials.value.email;
  var q = db.queryize.select('*')
  .from('staff', 's')
  .join('`company`', {alias: 'c', on: 's.CompanyID = c.CompanyID'})
  .join('`group`', {alias: 'g', on: 'c.GroupID = g.GroupID'})
  .where(`s.Email = '${email}'`)
  .where(`s.Active = 1`)
  .where(`c.Active = 1`)
  .where(`g.Active = 1`)
  .compile();
  try {
    var userInfo = await new Promise((resolve, reject) => {
      db.query(q, (error, rows)=>{
        if(error){ 
          reject(error); 
        } else if(!rows[0]){
          reject("Error: Credentials incorrect");
        } else {
          let data = rows[0];
          let password = req.swagger.params.credentials.value.password;
          let salt = data.PasswordSalt;
          let hash = pwdtools.generateHash(password, salt);
          if(data.PasswordHash !== hash){
            reject("Error: Credentials incorrect");
          }

          let result = {
            Email: data.Email,
            FirstName: data.FirstName,
            LastName: data.LastName,
            StaffID: data.StaffID,
            CompanyID: data.CompanyID,
            GroupID: data.GroupID,
            StaffRoleID: data.StaffRoleID,
            ShareClients: data.ShareClients,
            GroupBasedServices: data.GroupBasedServices
          }
          resolve(result);
        }
      });
    });
    var q = db.queryize.select('c.*')
    .from('company', 'c')
    .join('locale', {alias: 'l', on: 'c.LocaleID = l.LocaleID'})
    .where(`c.CompanyID = ${userInfo.CompanyID}`)
    .compile();
    var companyInfo = await new Promise((resolve, reject) => {
      db.query(q, (error, rows)=>{
        if(error){ 
          reject(error); 
        } else if(!rows[0]){
          reject(`Error: Could not find company with ID: ${userInfo.CompanyID}`);
        } else {
          resolve(rows[0]);
        }
      });
    });
    
    var q = db.queryize.select('l.*')
    .from('company', 'c')
    .join('locale', {alias: 'l', on: 'c.LocaleID = l.LocaleID'})
    .where(`c.CompanyID = ${userInfo.CompanyID}`)
    .compile();
    var localeInfo = await new Promise((resolve, reject) => {
      db.query(q, (error, rows)=>{
        if(error){ 
          reject(error); 
        } else if(!rows[0]){
          reject(`Error: Could not find company with ID: ${userInfo.CompanyID}`);
        } else {
          resolve(rows[0]);
        }
      });
    });

    var q = db.queryize.select('*')
    .from('group', 'g')
    .where(`g.GroupID = ${userInfo.GroupID}`)
    .compile();

    var groupInfo = await new Promise((resolve, reject) => {
      db.query(q, (error, rows)=>{
        if(error){ 
          reject(error); 
        } else if(!rows[0]){
          reject(`Error: Could not find group with ID: ${userInfo.GroupID}`);
        } else {
          resolve(rows[0]);
        }
      });
    });
    companyInfo.Locale = localeInfo;
    userInfo.Locale = localeInfo;
    let tokenString = auth.issueToken(userInfo, 'admin');
    let response = {token: tokenString, userInfo: userInfo, companyInfo: companyInfo, groupInfo: groupInfo}
    res.json(response);
  } catch(err){
    return res.json({message:err}); 
  }
  
}


// staff/add
function staffAdd(req, res) {

  let email = req.swagger.params.credentials.value.email;
  let password = req.swagger.params.credentials.value.password;
  let salt = pwdtools.generateSalt();
  let hash = pwdtools.generateHash(password, salt);
  //Insert query
}





