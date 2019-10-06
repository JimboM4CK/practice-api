"use strict";
// Load the SDK for JavaScript
const Buffer = require("buffer/").Buffer;

const fs = require("fs");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);

var AWS = require("aws-sdk");
AWS.config.update({ region: "us-west-2" });

export default {
  compileTemplate: async function(payload) {
    try {
      payload.oneStarUrl = starUrl(payload.companyId, payload.recipientId, 1);
      payload.twoStarUrl = starUrl(payload.companyId, payload.recipientId, 2);
      payload.threeStarUrl = starUrl(payload.companyId, payload.recipientId, 3);
      payload.fourStarUrl = starUrl(payload.companyId, payload.recipientId, 4);
      payload.fiveStarUrl = starUrl(payload.companyId, payload.recipientId, 5);

      let template = await readFileAsync(
        `api/templates/${payload.templateName}.template`,
        "utf8"
      );
      let shortCode = "";
      while ((shortCode = findNextShortcode(template))) {
        let replacement = "";
        if (typeof payload[shortCode] !== "undefined") {
          replacement = payload[shortCode];
        }
        template = template.replace(`{{${shortCode}}}`, replacement);
      }
      return Promise.resolve(template);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  send: async function(payload) {
    try {
      if (typeof payload.replyTo !== "array") {
        payload.replyTo = [];
      }
      if (typeof payload.cc !== "array") {
        payload.cc = [];
      }
      if (typeof payload.body === "undefined") {
        throw "Parameter 'body' not found.";
      }
      if (typeof payload.subject !== "string") {
        throw "Parameter 'subject' not found or not a string.";
      }
      if (typeof payload.from !== "string") {
        throw "Parameter 'from' not found or not a string.";
      }
      if (typeof payload.to !== "object") {
        throw "Parameter 'to' not found or not an object.";
      }

      let params = {
        Destination: {
          ToAddresses: payload.to,
          CcAddresses: payload.cc
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: payload.body
            }
          },
          Subject: {
            Charset: "UTF-8",
            Data: payload.subject
          }
        },
        Source: payload.from,
        ReplyToAddresses: payload.replyTo
      };

      // Create the promise and SES service object
      let sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail(params)
        .promise();

      // Handle promise's fulfilled/rejected states
      sendPromise
        .then(function(data) {
          console.log(data.MessageId);
        })
        .catch(function(err) {
          console.error(err, err.stack);
        });
    } catch (error) {
      console.error("jim, ", error);
    }
  }
};

function starUrl(companyId, recipientId, rating) {
  let data = {
    companyId: companyId,
    recipientId: recipientId,
    rating: rating
  };
  let b64 = Buffer.from(JSON.stringify(data)).toString("base64");
  return `https://reviewsmart.com.au/?c=${b64}`;
}

function findNextShortcode(template) {
  template = ` ${template}`;
  let ini = template.indexOf("{{");
  if (ini === 0) {
    return false;
  }
  ini += 2;
  let len = template.indexOf("}}", ini) - ini;
  return template.substr(ini, len);
}
