import helpers from "../helpers";

module.exports = {
  // User/Login
  login: async function(req, res) {
    try {
      let loginInfo = await helpers.queries.user.login({
        email: req.swagger.params.payload.value.email,
        password: req.swagger.params.payload.value.password
      });
      let userInfo = await helpers.queries.user.info({
        userId: loginInfo.userId
      });
      let tokenString = helpers.auth.issueToken(
        userInfo.userId,
        {
          companyId: userInfo.companyId,
          groupId: userInfo.groupId
        },
        userInfo.isGroupLogin ? "group" : "company"
      );
      let response = {
        token: tokenString,
        mustChangePassword: userInfo.mustChangePassword ? true : false
      };
      res.json(response);
    } catch (error) {
      console.log("error", error);
      return res.json({ error: error });
    }
  },
  // User/Information
  information: async function(req, res) {
    try {
      let userInfo = await helpers.queries.user.info({
        userId: req.auth.sub
      });
      let groupInfo = await helpers.queries.group.info({
        groupId: userInfo.groupId
      });
      let companies = [];
      if (userInfo.isGroupLogin) {
        companies = await helpers.queries.group.companies({
          groupId: userInfo.groupId
        });
      } else {
        let companyInfo = await helpers.queries.group.info({
          companyId: companyInfo.companyId
        });
        companies.push(companyInfo);
      }
      let response = {
        user: userInfo,
        companies: companies,
        group: groupInfo
      };
      return res.json(response);
    } catch (error) {
      console.log(error);
      return res.json({ error: error });
    }
  },
  // User/ChangePassword
  changePassword: async function(req, res) {
    try {
      let oldPassword = req.swagger.params.payload.value.oldPassword;
      let newPassword = req.swagger.params.payload.value.newPassword;

      let userInfo = await helpers.queries.user.info({
        userId: req.auth.sub
      });

      let loginInfo = await helpers.queries.user.login({
        email: userInfo.email,
        password: oldPassword
      });

      helpers.queries.user.setPassword({
        userId: loginInfo.userId,
        oldPassword: oldPassword,
        newPassword: newPassword
      });

      return res.json({ success: true });
    } catch (error) {
      return res.json({ error: error });
    }
  },
  // User/Add
  add: function(req, res) {
    let email = req.swagger.params.credentials.value.email;
    let password = req.swagger.params.credentials.value.password;
    let salt = Password.generateSalt();
    let hash = Password.generateHash(password, salt);
    //TODO: Insert query
  }
};
