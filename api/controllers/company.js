import helpers from "../helpers";
var facebookCredentials = helpers.auth.facebookCredentials();

import { Facebook, FacebookApiException } from "fb";
const FB = new Facebook({ appId: facebookCredentials.clientId });

module.exports = {
  updateFacebookToken: async function(req, res) {
    let userData = helpers.misc.getUserDataJWT(req);
    let payload = req.swagger.params.payload.value;
    try {
      FB.api(
        `oauth/access_token?client_id=${facebookCredentials.clientId}&client_secret=${facebookCredentials.clientSecret}&grant_type=fb_exchange_token&fb_exchange_token=${payload.token}`,
        async response => {
          if (response && !response.error) {
            let dt = new Date();
            dt.setSeconds(dt.getSeconds() + parseInt(response.expires_in) - 60);
            await helpers.queries.company.update(userData.companyId, {
              facebookTokenString: response.access_token,
              facebookTokenExpiry: helpers.date.getUtcDateIso(dt)
            });
            res.json({ success: true });
          } else {
            throw response.error;
          }
        }
      );
    } catch (error) {
      res.json({ error: error });
    }
  }
};
