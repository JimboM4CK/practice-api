"use strict";
import database from "../../../config/database";
import helpers from "../../helpers";

module.exports = {
  info: async function(payload) {
    var q = database.queryize
      .select("g.id as `key`, g.title as `value`")
      .from("group", "g")
      .where(`g.id = ${payload.groupId}`)
      .where(`g.active = 1`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `Error: Could not find group with ID: ${payload.groupId}`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  companies: async function(payload) {
    var q = database.queryize
      .select("c.id, c.title as companyName, c.locale_id as localeId")
      .from("company", "c")
      .join("`group`", { alias: "g", on: "c.group_id = g.id" })
      .where(`g.id = ${payload.groupId}`)
      .compile();
    try {
      let rows = await database.query(q);
      rows = rows.map(row => {
        let id = row.id;
        delete row.id;
        return { key: id, value: row };
      });
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
