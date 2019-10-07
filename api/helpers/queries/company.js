"use strict";
import database from "../../../config/database";
import helpers from "../../helpers";

module.exports = {
  info: async function(payload) {
    var q = database.queryize
      .select(
        `
        c.id as companyId,
        c.title as companyName,
        c.websiteUrl,
        c.logoUrl,
        c.logoWidth,
        c.logoHeight,
        c.emailFrom,
        c.emailSubject,
        c.emailHeading,
        c.emailSubheading,
        c.emailFooter,
        t.title as templateName,
        c.locale_id as localeId
        `
      )
      .from("company", "c")
      .join("template", { alias: "t", on: "c.template_id = t.id" })
      .where(`c.id = ${payload.companyId}`)
      .where(`c.active = 1`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `Error: Could not find company with ID: ${payload.companyId}`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  update: async function(companyId, fields) {
    let keys = Object.keys(fields);
    let set = [];
    keys.forEach(key => {
      set.push(`${key}='${fields[key]}'`);
    });
    var q = `
    UPDATE company 
    SET ${set.join(", ")}
    WHERE id = ${companyId}
    `;
    try {
      let res = await database.query(q);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
