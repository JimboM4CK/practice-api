'use strict;'

const mysql = require('mysql');
const queryize = require('queryize');

const db = {
  db_settings: {
    connectionLimit: 50,
    host     : 'jmdb.cwcxibundeox.ap-southeast-2.rds.amazonaws.com',
    user     : 'root',
    password : 'JKaws123!',
    database : 'practice',
    timezone : 'UTC'
  },
  db_prefix: 'practice_',
  pool: false,
  queryize: queryize,
  getPool: function(){
    if(!this.pool){
      this.pool = mysql.createPool(this.db_settings);
    }
    return this.pool;
  },
  end: function(){
    if(this.connection) this.connection.end()
  },
  query: function(q, callback){
    const pool = this.getPool();
    let query = q.query ? q.query : q.toString();
    pool.query(query, (error, rows) => {
      callback(error, rows);
    });
  }
};

module.exports = db;
