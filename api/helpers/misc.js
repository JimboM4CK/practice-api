import JWT from "jsonwebtoken";

export default {
  decodeJWT: function(req) {
    let token = req.get("Authorization");
    var tokenString = token.split(" ")[1];
    return JWT.decode(tokenString);
  },
  getUserDataJWT: function(req) {
    return this.decodeJWT(req).config;
  },
  compileQueryJWT: function(req, q, alias) {
    let userData = this.getUserDataJWT(req);
    if (userData.GroupBasedServices) {
      q.where(`${alias}.GroupID = '${userData.GroupID}'`);
    } else {
      q.where(`${alias}.CompanyID = '${userData.CompanyID}'`);
    }
    return q.compile();
  },
  compileClientQueryJWT: function(req, q, alias) {
    let userData = this.getUserDataJWT(req);
    if (userData.ShareClients) {
      q.where(`${alias}.GroupID = '${userData.GroupID}'`);
    } else {
      q.where(`${alias}.CompanyID = '${userData.CompanyID}'`);
    }
    return q.compile();
  }
};
