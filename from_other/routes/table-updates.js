const mysql = require('../db');
const express = require('express');
const app = module.exports = express();

app.get('/api/updates/:date', (req, res) => {

  try {
    let updates = await fetchUpdates();
    let diaryObjects = await diaryObjects(date);
  } catch(err) {
    return err;
  }

  
});

async function fetchUpdates() {
  var q = mysql.queryize.select('tu.*')
  .from('table_updates', 'tu')
  .where(`tu.CompanyID = '${companyId}'`)
  .where(`tu.GroupID = '${groupId}'`)
  .compile();

  mysql.query(q, (error, rows)=>{
    if(error){ 
      throw error; 
    } else {      
      return rows; 
    }
  });

}


async function diaryObjects(date) {
  var q = mysql.queryize.select('e.*')
  .from('entry', 'e')
  .where(`e.CompanyID = '${companyId}'`)
  .where(`e.GroupID = '${groupId}'`)
  .compile();

  mysql.query(q, (error, rows)=>{
    if(error){ 
      res.end(error); 
    } else {      
      res.json(rows); 
    }
  });
}