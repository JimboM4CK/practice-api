"use strict";
import database from "../../../config/database";
import helpers from "../../helpers";

module.exports = {
  login: async function(payload) {
    var q = database.queryize
      .select("`u`.*")
      .from("user", "u")
      .where(`u.email = '${payload.email}'`)
      .where(`u.active = 1`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw "Invalid email or password";
      }
      let data = rows[0];
      if (
        !helpers.password.validatePassword(
          payload.password,
          data.password_salt,
          data.password_hash
        )
      ) {
        throw "Invalid email or password";
      }
      let response = {
        userId: data.id
      };
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  info: async function(payload) {
    var q = database.queryize
      .select(
        `
        id as userId,
        email as email, 
        first_name as firstName, 
        last_name as lastName, 
        must_change_password as mustChangePassword,
        is_group_login as isGroupLogin,
        company_id as companyId,
        group_id as groupId
        `
      )
      .from("user", "u")
      .where(`u.id = ${payload.userId}`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `Error: Could not find user with ID: ${payload.userId}`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  setPassword: async function(payload) {
    var q = database.queryize
      .update("user")
      .set("")
      .where(`u.id = ${payload.userId}`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `Error: Could not find user with ID: ${payload.userId}`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
