'use strict';

var db = require('../../config/db');

module.exports = {
  loginUser: loginUser,
};


// login
function loginUser(req, res) {
  var q = db.queryize.select('s.*')
  .from('staff', 's')
  .join('company', {alias: 'c', on: 's.CompanyID = c.CompanyID'})
  .join('group', {alias: 'g', on: 'c.GroupID = g.GroupID'})
  .where(`s.Email = ${req.swagger.params.email.value}`)
  .where(`s.Password = ${req.swagger.params.password.value}`)
  .where(`s.Active = 1`)
  .where(`p.Active = 1`)
  .where(`g.Active = 1`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.end(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}
