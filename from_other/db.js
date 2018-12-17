const mysql = require('mysql');
const queryize = require('queryize');
const config = require('./config.js');

const connector = {
  pool: false,
  queryize: queryize,
  getPool: function(){
    if(!this.pool){
      this.pool = mysql.createPool(config.db_settings);
    }
    return this.pool;
  },
  end: function(){
    if(this.connection) this.connection.end()
  },
  query: function(q, callback){
    const pool = this.getPool();
    pool.query(q.query, q.data, (error, results, fields) => {
      callback(error, results);
    });
  }
};

module.exports = connector;
