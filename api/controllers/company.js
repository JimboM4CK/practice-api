import helpers from "../helpers";
var facebookCredentials = helpers.auth.facebookCredentials();

import { Facebook, FacebookApiException } from "fb";
var FB = new Facebook({ appId: facebookCredentials.clientId });

module.exports = {
  companyInformation: async function(req, res) {
    try {
      let userData = helpers.misc.getUserDataJWT(req);
      let companyId = req.swagger.params.id.value;
      if (userData.companyId !== companyId && !userData.isGroupLogin) {
        throw "You don't have sufficient access.";
      }
      let information = await helpers.queries.company.info({
        companyId: companyId,
        groupId: userData.groupId
      });

      //Fetch whole list of integrations
      let integrations = await helpers.queries.company.integrations({
        companyId: companyId
      });

      //Filter out any inactive integrations
      integrations = integrations.filter(integration => {
        return integration.active;
      });

      //Restrict data output
      integrations = integrations.map(integration => {
        return {
          companyIntegrationId: integration.companyIntegrationId,
          pageId: integration.pageId,
          pageName: integration.pageName,
          reviewTypeId: integration.reviewTypeId,
          tokenExpiry: integration.tokenExpiry
        };
      });
      res.json({
        companyInformation: information,
        integrations: integrations
      });
    } catch (error) {
      console.log(error);
      res.json({ error: error });
    }
  },
  getIntegrationAssociatedPages: async function(req, res) {
    try {
      let userData = helpers.misc.getUserDataJWT(req);
      let companyIntegrationId = req.swagger.params.id.value;

      let integrations = await helpers.queries.company.integrations({
        companyId: userData.companyId
      });
      let integration = helpers.misc.arrayKeyObject(
        integrations,
        "companyIntegrationId",
        companyIntegrationId
      );
      if (integration === false) {
        throw "Could not find integration with provided id";
      }

      let response = [];
      switch (integration.reviewTypeId) {
        case 2:
          //Google
          //TODO: INTEGRATE THIS!!
          break;
        case 3:
          //Facebook
          response = await helpers.integration.facebookLinkedPages({
            tokenExpiry: integration.tokenExpiry,
            userToken: integration.userToken
          });
          break;
        default:
          throw `Review type id '${integration.reviewTypeId}' not recognised.`;
          break;
      }

      let pages = [];
      response.forEach(page => {
        pages.push({ key: page.id, value: page.name });
      });
      res.json(pages);
    } catch (error) {
      console.log(error);
      res.json({ error: error });
    }
  },

  initiateIntegration: async function(req, res) {
    try {
      let userData = helpers.misc.getUserDataJWT(req);
      let payload = req.swagger.params.payload.value;

      if (payload.reviewTypeId === 3) {
        //TODO: If facebook, extend user token
        let fbResponse = await helpers.integration.facebookExtendToken({
          userToken: payload.userToken
        });
        payload.tokenExpiry = fbResponse.tokenExpiry;
        payload.userToken = fbResponse.userToken;
      }
      let response = await helpers.queries.company.initiateIntegration({
        companyId: userData.companyId,
        reviewTypeId: payload.reviewTypeId,
        tokenExpiry: payload.tokenExpiry,
        userToken: payload.userToken
      });
      res.json({ success: true, companyIntegrationId: response.id });
    } catch (error) {
      console.log(error);
      res.json({ error: error });
    }
  },
  completeIntegration: async function(req, res) {
    try {
      let userData = helpers.misc.getUserDataJWT(req);
      let payload = req.swagger.params.payload.value;
      let response = await helpers.integration.completeIntegration({
        companyId: userData.companyId,
        companyIntegrationId: payload.companyIntegrationId,
        pageId: payload.pageId
      });
      res.json({
        success: true,
        companyIntegrationId: response.companyIntegrationId,
        tokenExpiry: response.tokenExpiry
      });
    } catch (error) {
      console.log(error);
      res.json({ error: error });
    }
  },
  disableIntegration: async function(req, res) {
    try {
      let userData = helpers.misc.getUserDataJWT(req);
      let companyIntegrationId = req.swagger.params.id.value;
      await helpers.integration.disableIntegration({
        companyId: userData.companyId,
        companyIntegrationId: companyIntegrationId
      });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.json({ error: error });
    }
  }
};
