"use strict";

import database from "../../config/database";
import helpers from "../helpers/misc";

export default {
  // groups/:id
  getGroup: function(req, res) {
    let userData = helpers.misc.getUserDataJWT(req);
    var q = database.queryize
      .select("g.*")
      .from("group", "g")
      .where(`g.GroupID = ${req.swagger.params.id.value}`)
      .where(`g.GroupID = ${userData.GroupID}`) //make sure they have access to this group
      .compile();

    database.query(q, (error, rows) => {
      if (error) {
        res.json(error);
      } else if (!rows[0]) {
        res.end();
      } else {
        res.json(rows);
      }
    });
  },

  // groups/:id/companies
  getGroupCompanies: function(req, res) {
    let userData = helpers.misc.getUserDataJWT(req);
    var q = database.queryize
      .select("c.*")
      .from("company", "c")
      .where(`c.Active = 1`)
      .where(`c.GroupID = ${req.swagger.params.id.value}`)
      .where(`c.GroupID = ${userData.GroupID}`)
      .compile();

    database.query(q, (error, rows) => {
      if (error) {
        res.json(error);
      } else if (!rows[0]) {
        res.end();
      } else {
        res.json(rows);
      }
    });
  }
};
