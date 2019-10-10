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
      .select("c.id as `key`, c.title as `value`")
      .from("company", "c")
      .join("`group`", { alias: "g", on: "c.group_id = g.id" })
      .where(`g.id = ${payload.groupId}`)
      .compile();
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
