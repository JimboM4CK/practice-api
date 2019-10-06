"use strict;";

import mysql from "mysql";
let queryize = require("queryize");
var util = require("util");

export default {
  databaseSettings: {
    connectionLimit: 50,
    host: "jmdb.cwcxibundeox.ap-southeast-2.rds.amazonaws.com",
    user: "root",
    password: "JKaws123!",
    database: "review_generation",
    timezone: "UTC"
  },
  pool: false,
  queryize: queryize,
  getPool: function() {
    if (!this.pool) {
      this.pool = mysql.createPool(this.databaseSettings);
    }
    return this.pool;
  },
  end: function() {
    if (this.connection) this.connection.end();
  },
  query: function(q) {
    var pool = this.getPool();
    pool.query = util.promisify(pool.query);
    let query = q.query ? q.query : q.toString();
    return pool.query(query);
  }
};
