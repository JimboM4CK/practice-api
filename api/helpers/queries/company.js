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
        c.website_url as websiteUrl,
        c.logo_url as logoUrl,
        c.logo_width as logoWidth,
        c.logo_height as logoHeight,
        c.email_from as emailFrom,
        c.email_subject as emailSubject,
        c.email_heading as emailHeading,
        c.email_subheading as emailSubheading,
        c.email_footer as emailFooter,
        t.title as templateName,
        c.locale_id as localeId
        `
      )
      .from("company", "c")
      .join("template", { alias: "t", on: "c.template_id = t.id" })
      .where(`c.id = ${payload.companyId}`)
      .where(`c.group_id = ${payload.groupId}`)
      .where(`c.active = 1`)
      .compile();
    try {
      let rows = await database.query(q);
      if (!rows.length) {
        throw `You don't have sufficient access.`;
      }
      return Promise.resolve(rows[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  integrations: async function(payload) {
    var q = database.queryize
      .select(
        `
        ci.id as companyIntegrationId,
        ci.review_type_id as reviewTypeId,
        rt.title as reviewTypeTitle,
        ci.token_expiry as tokenExpiry,
        ci.user_token as userToken,
        ci.page_token as pageToken,
        ci.page_id as pageId,
        ci.page_name as pageName,
        ci.active
        `
      )
      .from("company_integration", "ci")
      .join("company", { alias: "c", on: "ci.company_id = c.id" })
      .join("review_type", { alias: "rt", on: "ci.review_type_id = rt.id" })
      .where(`c.id = ${payload.companyId}`)
      .where(`c.active = 1`)
      .compile();
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  initiateIntegration: async function(payload) {
    var q = `
    INSERT INTO company_integration
      (company_id, review_type_id, token_expiry, user_token, active) 
    VALUES 
      ('${payload.companyId}', '${payload.reviewTypeId}', '${payload.tokenExpiry}', '${payload.userToken}', '0')
    `;
    try {
      let res = await database.query(q);
      return Promise.resolve({ id: res.insertId });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  updateIntegration: async function(id, fields) {
    let keys = Object.keys(fields);
    let set = [];
    keys.forEach(key => {
      let value = fields[key];
      if (fields[key] !== null) {
        value = `'${fields[key]}'`;
      } else {
        value = "null";
      }
      set.push(`${key}=${value}`);
    });
    var q = `
    UPDATE company_integration 
    SET ${set.join(", ")}
    WHERE id = '${id}'
    `;
    console.log(q);
    try {
      let res = await database.query(q);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  disableIntegration: async function(payload) {
    var q = `
    UPDATE company_integration
    SET active = 0
    WHERE id = '${payload.companyIntegrationId}'
    `;
    try {
      await database.query(q);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  deleteIntegration: async function(payload) {
    var q = `
    DELETE FROM company_integration
    WHERE id = '${payload.id}'
    `;
    try {
      await database.query(q);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  deleteIncompleteIntegrations: async function(payload) {
    var q = `
    DELETE FROM company_integration
    WHERE company_id = '${payload.companyId}' AND page_token IS NULL
    `;
    try {
      await database.query(q);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  update: async function(companyId, fields) {
    let keys = Object.keys(fields);
    let set = [];
    keys.forEach(key => {
      let value = fields[key];
      if (fields[key] !== null) {
        value = `'${fields[key]}'`;
      } else {
        value = "null";
      }
      set.push(`${key}=${value}`);
    });
    var q = `
    UPDATE company 
    SET ${set.join(", ")}
    WHERE id = ${companyId}
    `;
    try {
      await database.query(q);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
