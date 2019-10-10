import auth from "./auth";
import queries from "./queries";
var facebookCredentials = auth.facebookCredentials();

import { Facebook, FacebookApiException } from "fb";
var FB = new Facebook({ appId: facebookCredentials.clientId });

export default {
  fetchLinkedPages: async function(payload) {
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
  }
};
