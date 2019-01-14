'use strict';
//var util = require('util');
var db = require('../../config/db');
var misc =  require('../helpers/misc');
module.exports = {
  searchClients: searchClients,
  clientEpisodes: clientEpisodes
};

// clients/search/:query
function searchClients(req, res) {
  var q = db.queryize.select([
      'c.*',
      `CONCAT((CASE WHEN PreferredName IS NOT NULL THEN PreferredName ELSE FirstName END), ' ', LastName) AS Name`
  ])
  .from('client', 'c')
  .where(`(
    c.FirstName LIKE '%${req.swagger.params.query.value}%'
    OR c.PreferredName LIKE '%${req.swagger.params.query.value}%'
    OR c.LastName LIKE '%${req.swagger.params.query.value}%'
    OR CONCAT((CASE WHEN PreferredName IS NOT NULL THEN PreferredName ELSE FirstName END), ' ', LastName) LIKE '%${req.swagger.params.query.value}%'
  )`);
  q = misc.compileClientQueryJWT(req, q, 'c');

  db.query(q, (error, rows)=>{
    if(error) return res.json(error);
    let response = {
        success: true,
        results: rows
    }
    res.json(response);   
  });
}

// clients/:id/episodes
function clientEpisodes(req, res) {
  var q = db.queryize.select([
      'e.EpisodeID',
      'e.Title'
  ])
  .from('episode', 'e')
  .join('client', {alias:'c', on: 'e.ClientID = c.ClientID'})
  .where(`c.ClientID = '${req.swagger.params.id.value}'`);
  q = misc.compileClientQueryJWT(req, q, 'c');

  db.query(q, (error, rows)=>{
    if(error) return res.json(error);
    let response = {
        success: true,
        results: rows
    }
    res.json(response);   
  });
}
