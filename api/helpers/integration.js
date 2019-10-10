import queries from "./queries";
import misc from "./misc";
import facebook from "./facebook";
import date from "./date";

import auth from "./auth";
var facebookCredentials = auth.facebookCredentials();

import { Facebook, FacebookApiException } from "fb";
var FB = new Facebook({ appId: facebookCredentials.clientId });

export default {
  completeIntegration: async function(payload) {
    try {
      let integrations = await queries.company.integrations({
        companyId: payload.companyId
      });
      let integration = misc.arrayKeyObject(
        integrations,
        "companyIntegrationId",
        payload.companyIntegrationId
      );

      let pages = await facebook.fetchLinkedPages(integration);
      let page = misc.arrayKeyObject(pages, "id", payload.pageId);
      if (!page) {
        throw "Invalid page id";
      }

      let dt = new Date();
      //Add 60 days as I can't see the expires_in anymore
      dt.setSeconds(dt.getSeconds() + 5184000);
      let tokenExpiry = date.getUtcDateIso(dt);
      let updates = {
        page_id: payload.pageId,
        page_name: page.name,
        page_token: page.access_token,
        token_expiry: tokenExpiry,
        active: 1
      };

      let updateId = payload.companyIntegrationId;

      let pageMatchIntegration = misc.arrayKeyObject(
        integrations,
        "pageId",
        payload.pageId
      );

      //Mark all integrations with same review type as inactive
      let sameTypeIntegrations = integrations.filter(obj => {
        return obj.reviewTypeId === integration.reviewTypeId;
      });
      sameTypeIntegrations.forEach(async obj => {
        try {
          await queries.company.disableIntegration(obj);
        } catch (error) {
          console.log(error);
        }
      });

      if (pageMatchIntegration) {
        //change updateId to the page match integration object instead of submitted one as they've already integrated it
        updateId = pageMatchIntegration.companyIntegrationId;
      }
      await queries.company.updateIntegration(updateId, updates);

      // Cleaning up incomplete integrations.
      await queries.company.deleteIncompleteIntegrations({
        companyId: payload.companyId
      });
      return Promise.resolve({
        companyIntegrationId: updateId,
        tokenExpiry: tokenExpiry
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  disableIntegration: async function(payload) {
    try {
      let integrations = await queries.company.integrations({
        companyId: payload.companyId
      });
      let integration = misc.arrayKeyObject(
        integrations,
        "companyIntegrationId",
        payload.companyIntegrationId
      );
      if (!integration) {
        throw "Could not find integration with provided id.";
      }
      await queries.company.disableIntegration(integration);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  facebookLinkedPages: async function(payload) {
    try {
      if (new Date(payload.tokenExpiry) <= new Date()) {
        throw "Facebook Token Expired";
      }
      FB.setAccessToken(payload.userToken);
      let response = await FB.api(`/me/accounts`);
      if (response && !response.error) {
        return Promise.resolve(response.data);
      } else {
        throw response.error;
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },
  facebookExtendToken: async function(payload) {
    try {
      let response = await FB.api(
        `/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${facebookCredentials.clientId}&` +
          `client_secret=${facebookCredentials.clientSecret}&` +
          `fb_exchange_token=${payload.userToken}`
      );
      if (response && !response.error) {
        let dt = new Date();
        //Add 60 days as I can't see the expires_in anymore
        dt.setSeconds(dt.getSeconds() + 5184000);
        return Promise.resolve({
          tokenExpiry: date.getUtcDateIso(dt),
          userToken: response.access_token
        });
      } else {
        throw response.error;
      }
    } catch (error) {
      return Promise.reject({ error: error });
    }
  }
};
