"use strict";
import database from "../../../config/database";

module.exports = {
  info: async function(payload) {
    var q = database.queryize
      .select(
        `
            r.id as recipientId,
            first_name as firstName,
            last_name as lastName,
            email,
            date_unsubscribed as dateUnsubscribed
        `
      )
      .from("recipient", "r")
      .where(`r.id = ${payload.recipientId}`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `Error: Could not find recipient with ID: ${payload.recipientId}`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
