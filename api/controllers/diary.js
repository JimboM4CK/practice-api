'use strict';
//var util = require('util');
var db = require('../../config/db');
var misc =  require('../helpers/misc');
module.exports = {
  diaryStaff: diaryStaff,
  diaryEntries: diaryEntries
};



// diary/staff
function diaryStaff(req, res) {
  let userData = misc.getUserDataJWT(req);
  var q = db.queryize.select('s.*')
  .from('staff', 's')
  .where(`s.OnDiary = '1'`)
  .where(`s.Active = '1'`)
  .where(`s.CompanyID = ${userData.CompanyID}`)
  .compile();

  db.query(q, (error, rows)=>{
    if(error){ res.json(error); }
    else if(!rows[0]){ res.end(); }
    else { res.json(rows); }
  });
}

// diary/entries
function diaryEntries(req, res) {
  let userData = misc.getUserDataJWT(req);
  var q = db.queryize.select(['e.*', 'et.Title as EntryType'])
  .from('entry', 'e')
  .join('entry_type', {alias: 'et', on: 'e.EntryTypeID = et.EntryTypeID'})
  .where(`DATE_FORMAT(e.StartTime, '%Y-%m-%d') = '${req.swagger.params.date.value}'`)
  .where(`e.CompanyID = ${userData.CompanyID}`)
  .compile();
  db.query(q, (error, rows)=>{
    if(error){ res.json(error);  }
    else if(!rows[0]){ res.end(); }
    else { 
      let result = [];
      rows.forEach(row => {
        var q = db.queryize.select(['ed.*','c.FirstName', 'c.PreferredName', 'c.LastName'])
        .from('entry_detail', 'ed')
        .join('client', {alias: 'c', on: 'ed.ClientID = c.ClientID'})
        .where(`ed.EntryID = '${row.EntryID}'`)
        .compile();
        db.query(q, (entryDetailError, entryDetailRows)=>{
          if(error){ res.json(entryDetailError); }
          else {
            result.push({
              EntryID: row.EntryID,
              EntryType: row.EntryType,
              StaffID: row.StaffID,
              StartTime: row.StartTime,
              EndTime: row.EndTime,
              TimeSlots: row.TimeSlots,
              Title: row.Title,
              Description: row.Description,
              ServiceTemplateID: row.ServiceTemplateID,
              RoomID: row.RoomID,
              TreatmentLocationID: row.TreatmentLocationID,
              MaxAttendees: row.MaxAttendees,
              EntryDetails: entryDetailRows
            });
          }
        });
        res.json(result);
      });
    }
  });
}