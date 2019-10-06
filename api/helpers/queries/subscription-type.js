"use strict";
import database from "../../../config/database";
import helpers from "../../helpers";

module.exports = {
  info: async function(payload) {
    var q = database.queryize
      .select("st.*")
      .from("subscription_type", "st")
      .where(`st.id = ${payload.subscriptionTypeId}`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `Error: Could not find subscription type with ID: ${
          payload.subscriptionTypeId
        }`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  all: async function(payload) {
    var q = database.queryize
      .select("`id` as `key`, `title` as `value`")
      .from("subscription_type")
      .where(`active = 1`)
      .compile();
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
