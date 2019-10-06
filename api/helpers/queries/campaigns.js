"use strict";
import database from "../../../config/database";
//import helpers from "../../helpers";

module.exports = {
  all: async function(payload) {
    let q = `
    SELECT
      c.id as campaignId,
      c.date_created as dateCreated,
      c.date_modified as dateModified,
      c.date_created as dateCommenced,
      c.date_deleted as dateDeleted,
      (
        SELECT 
          COUNT(cr.id)
        FROM 
          campaign_recipient cr 
        WHERE 
          c.id = cr.campaign_id
      ) AS recipientCount,
        (
        SELECT 
          AVG(cr.rating)
        FROM 
          campaign_recipient cr
        WHERE
          c.id = cr.campaign_id
          AND cr.rating IS NOT NULL
      ) AS averageRating,
        (
        SELECT 
          COUNT(cr.feedback)
        FROM 
          campaign_recipient cr
        WHERE
          c.id = cr.campaign_id
          AND cr.feedback IS NOT NULL
      ) AS feedbackCount
    FROM campaign c
    WHERE c.company_id = '${payload.companyId}'`;
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows);
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  },
  info: async function(payload) {
    let q = `
    SELECT
      c.id as campaignId,
      c.company_id as companyId,
      c.date_created as dateCreated,
      c.date_modified as dateModified,
      c.date_created as dateCommenced,
      c.date_deleted as dateDeleted,
      (
        SELECT 
          COUNT(cr.id)
        FROM 
          campaign_recipient cr 
        WHERE 
          c.id = cr.campaign_id
      ) AS recipientCount,
        (
        SELECT 
          AVG(cr.rating)
        FROM 
          campaign_recipient cr
        WHERE
          c.id = cr.campaign_id
          AND cr.rating IS NOT NULL
      ) AS averageRating,
        (
        SELECT 
          COUNT(cr.feedback)
        FROM 
          campaign_recipient cr
        WHERE
          c.id = cr.campaign_id
          AND cr.feedback IS NOT NULL
      ) AS feedbackCount
    FROM campaign c
    WHERE c.id = '${payload.campaignId}'`;
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows[0]);
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  },
  campaignRecipients: async function(payload) {
    let q = `
    SELECT
      cr.id as campaignRecipientId,
      cr.date_sent as dateSent,
      cr.date_delivered as dateDelivered,
      cr.rating,
      cr.feedback,
      cre.review_type_id as reviewTypeId,
      cre.date_created as dateRated,
      cr.recipient_id as recipientId,
      r.first_name as firstName,
      r.last_name as lastName,
      r.email,
      r.date_unsubscribed as dateUnsubscribed
    FROM campaign_recipient cr
    INNER JOIN recipient r ON r.id = cr.recipient_id
    LEFT OUTER JOIN campaign_recipient_event cre ON cr.id = cre.campaign_recipient_id
    WHERE cr.campaign_id = '${payload.campaignId}'`;
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  campaignEvents: async function(payload) {
    let q = `
    SELECT
      cr.id as campaignRecipientId,
      cre.review_type_id as reviewTypeId,
      cre.date_created as dateReviewed
    FROM campaign_recipient cr
    INNER JOIN campaign_recipient_event cre ON cr.id = cre.campaign_recipient_id
    WHERE cr.campaign_id = '${payload.campaignId}'`;
    try {
      let rows = await database.query(q);
      return Promise.resolve(rows);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};
