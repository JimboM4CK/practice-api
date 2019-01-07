'use strict';
//var util = require('util');
var db = require('../../config/db');
var misc =  require('../helpers/misc');
var date =  require('../helpers/date');
module.exports = {
  diaryStaff: diaryStaff,
  diaryEntries: diaryEntries,
  diaryEntriesAdd: diaryEntriesAdd,
  diaryEntriesRemove: diaryEntriesRemove
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
async function diaryEntries(req, res) {
  let userData = misc.getUserDataJWT(req);
  let q = db.queryize.select([
    'e.EntryID', 
    'e.StaffID', 
    'e.StartTime', 
    'e.EndTime',  
    'e.Title', 
    'e.Description', 
    'e.ServiceTemplateID', 
    'e.RoomID', 
    'e.TreatmentLocationID', 
    'e.MaxAttendees', 
    'et.Title as EntryType'
  ])
  .from('entry', 'e')
  .join('entry_type', {alias: 'et', on: 'e.EntryTypeID = et.EntryTypeID'})
  .where(`DATE_FORMAT(CONVERT_TZ(e.StartTime, '+00:00', '${date.getTimezoneOffset(userData.Timezone)}'), '%Y-%m-%d') = '${req.swagger.params.date.value}'`)
  .where(`e.CompanyID = ${userData.CompanyID}`)
  .compile();

  try {
    let entries = await new Promise((resolve, reject) => {
      db.query(q, (error, rows)=>{
        if(error) reject(error);
        resolve(rows);
      });
    });

    let result = await Promise.all(entries.map(async (row) => {
      let q = db.queryize.select(['ed.*','c.FirstName', 'c.PreferredName', 'c.LastName'])
      .from('entry_detail', 'ed')
      .join('client', {alias: 'c', on: 'ed.ClientID = c.ClientID'})
      .where(`ed.EntryID = '${row.EntryID}'`)
      .compile();
      return await new Promise((resolve, reject) => {
        db.query(q, (entryDetailError, entryDetailRows)=>{
          if(entryDetailError) reject(entryDetailError); 
          if(!entryDetailRows.length) resolve(row);
          row.EntryDetails = entryDetailRows;
          resolve(row);
        });
      });
    }));

    return res.json(result);
  } catch(err) {
    return res.json({error:err});
  }
}


// diary/entries/add
async function diaryEntriesAdd(req, res) {
  let userData = misc.getUserDataJWT(req);
  let typeId = 0;
  switch(req.swagger.params.entryData.value.type){
    case 'appointment': typeId = 1; break;
    case 'reservation': typeId = 2; break;
    case 'note': typeId = 3; break;
    case 'roster': typeId = 4; break;
    default: throw 'Invalid Entry Type';
  }

  
  let startTime = new Date(req.swagger.params.entryData.value.startTime);
  let endTime = new Date(req.swagger.params.entryData.value.endTime);

  let q = db.queryize.select([
    'e.EntryID',
    'e.StartTime', 
    'e.EndTime'
  ])
  .from('entry', 'e')
  .where(`(
    (
      '${date.getDateIso(startTime)}'
      BETWEEN 
        CONVERT_TZ(e.StartTime, '+00:00', '${date.getTimezoneOffset(userData.Timezone)}')
        AND CONVERT_TZ(e.EndTime, '+00:00', '${date.getTimezoneOffset(userData.Timezone)}')
    ) OR (
      '${date.getDateIso(endTime)}'
      BETWEEN 
        CONVERT_TZ(e.StartTime, '+00:00', '${date.getTimezoneOffset(userData.Timezone)}')
        AND CONVERT_TZ(e.EndTime, '+00:00', '${date.getTimezoneOffset(userData.Timezone)}')
    )
  )`)
  .where(`e.StaffID = ${req.swagger.params.entryData.value.staffId}`)
  .where(`e.EntryTypeID = ${typeId}`)
  .where(`e.CompanyID = ${userData.CompanyID}`)
  .compile();

  let reservations = await new Promise((resolve, reject) => {
    db.query(q, (error, rows)=>{
      if(error) reject(error);
      let result = {
        entryIds: []
      }
      rows.forEach(row => {
        let tmpStartTime = new Date(row.StartTime);
        let tmpEndTime = new Date(row.EndTime);
        if(startTime > tmpStartTime) startTime = tmpStartTime;
        if(endTime < tmpEndTime) endTime = tmpEndTime;
        result.entryIds.push(row.EntryID);
      });
      resolve(result);
    });
  });

  if(reservations.entryIds.length){
    q = db.queryize.delete('entry')
    .where(`EntryID IN (${reservations.entryIds.join(',')})`)
    .compile();
    db.query(q, () => {
    });
  }

  q = db.queryize().insert({
    EntryTypeID: typeId,
    StaffID: req.swagger.params.entryData.value.staffId,
    StartTime: startTime,
    EndTime: endTime,
    CompanyID: userData.CompanyID
  }).into('entry');

  try {
    db.query(q, (error, response)=>{
      res.json(response);
    });
  } catch(err){
    return res.json({message: err});
  }  
}


async function diaryEntriesRemoveReservation(req){
  let userData = misc.getUserDataJWT(req);
  let data = req.swagger.params.entryData.value;
  let startTime = new Date(data.startTime);
  let endTime = new Date(data.endTime);
  let typeId = 2; //reservation

  try {
    
    
    let q = db.queryize.select([
      'e.EntryID',
      'e.StartTime', 
      'e.EndTime'
    ])
    .from('entry', 'e')
    .where(`(
      (
        '${date.getUtcDateIso(startTime)}' BETWEEN e.StartTime AND e.EndTime
      ) OR (
        '${date.getUtcDateIso(endTime)}' BETWEEN e.StartTime AND e.EndTime
      )
    )`)
    .where(`e.StaffID = ${data.staffId}`)
    .where(`e.EntryTypeID = ${typeId}`)
    .where(`e.CompanyID = ${userData.CompanyID}`)
    .compile();

    let reservations = await new Promise((resolve, reject) => {
      db.query(q, (error, rows)=>{
        if(error) reject(error);
        let result = {
          deleteEntryIds: [],
          updateEntries: [],
          createEntries: []
        }
        rows.forEach(row => {
          let tmpStartTime = new Date(row.StartTime);
          let tmpEndTime = new Date(row.EndTime);
          if(tmpStartTime > startTime && tmpEndTime < endTime){
            result.deleteEntryIds.push(row.EntryID);
          } else if(startTime > tmpStartTime && endTime < tmpEndTime) {
            result.updateEntries.push({
              entryId: row.EntryID,
              startTime: tmpStartTime,
              endTime: startTime
            });
            result.createEntries.push({
              staffId: data.staffId,
              typeId: typeId,
              startTime: endTime,
              endTime: tmpEndTime
            });
          } else if(startTime > tmpStartTime) {
            result.updateEntries.push({
              entryId: row.EntryID,
              startTime: tmpStartTime,
              endTime: startTime
            });
          } else if(endTime < tmpEndTime){
            result.updateEntries.push({
              entryId: row.EntryID,
              startTime: endTime,
              endTime: tmpEndTime
            });
          }
        });
        resolve(result);
      });
    });

    if(reservations.deleteEntryIds.length){
      await new Promise((resolve, reject) => {
        q = db.queryize.delete('entry')
        .where(`EntryID IN (${reservations.deleteEntryIds.join(',')})`)
        .compile();
        db.query(q, (error, response) => {
          if(error) reject(error);
          resolve(response);
        });
      });
    }
    
    if(reservations.updateEntries.length){
      await Promise.all(reservations.updateEntries.map(async (entry) => {
        q = db.queryize.update('entry')
        .set(`StartTime = '${date.getUtcDateIso(entry.startTime)}'`)
        .set(`EndTime = '${date.getUtcDateIso(entry.endTime)}'`)
        .where(`EntryID = ${entry.entryId}`)
        .compile();
        db.query(q, (error, response) => {
          if(error) return Promise.reject(error);
          return Promise.resolve(response);
        });
      }));
    }

    if(reservations.createEntries.length){
      await Promise.all(reservations.createEntries.map(async (entry) => {
        q = db.queryize().insert({
          EntryTypeID: entry.typeId,
          StaffID: entry.staffId,
          StartTime: date.getUtcDateIso(entry.startTime),
          EndTime: date.getUtcDateIso(entry.endTime),
          CompanyID: userData.CompanyID
        }).into('entry');
        db.query(q, (error, response)=>{
          if(error) return Promise.reject(error);
          return Promise.resolve(response);
        });
      }));
    }
    return Promise.resolve();
  } catch(err){
    return Promise.reject(err);
  }  

}

function diaryEntriesRemoveObject(req){
  let userData = misc.getUserDataJWT(req);
  let data = req.swagger.params.entryData.value;
  q = db.queryize.delete('entry')
  .where(`EntryID = '${data.entryId}'`)
  .where(`CompanyID = ${userData.CompanyID}`)
  .compile();
  db.query(q, (error, response) => {
    if(error) return Promise.reject(error);
    return Promise.resolve(response);
  });
}

async function diaryEntriesRemove(req, res) {
  let response = '';
  try {
    switch(req.swagger.params.entryData.value.type){
      case 'appointment': response = await diaryEntriesRemoveObject(req); break;
      case 'reservation': response = await diaryEntriesRemoveReservation(req); break;
      case 'note': response = await diaryEntriesRemoveObject(req); break;
      case 'roster': response = await diaryEntriesRemoveRoster(req); break;
      default: throw 'Invalid Entry Type';
    }
    res.json(response);
  } catch(err){
    return res.json({message: err});
  }
}
