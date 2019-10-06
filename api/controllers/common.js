import helpers from "../helpers";

module.exports = {
  // Configuration
  configuration: async function(req, res) {
    try {
      //let locales = await helpers.queries.locale.all();
      let reviewTypes = await helpers.queries.reviewType.all();
      let subscriptionTypes = await helpers.queries.subscriptionType.all();
      let response = {
        //locale: locales,
        reviewType: reviewTypes,
        subscriptionType: subscriptionTypes
      };
      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.json({ error: error });
    }
  }
};
