"use strict";
import database from "../../../config/database";
import helpers from "../../helpers";

module.exports = {
  info: async function(payload) {
    var q = database.queryize
      .select("l.*")
      .from("locale", "l")
      .where(`l.id = ${payload.localeId}`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `Error: Could not find locale with ID: ${payload.localeId}`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  all: async function(payload) {
    var q = database.queryize
      .select("`id` as `key`, `title` as `value`")
      .from("locale")
      .compile();
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
