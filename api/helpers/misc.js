var jwt = require('jsonwebtoken');

function decodeJWT(req){
    let token = req.get('Authorization');
    var tokenString = token.split(' ')[1];
    return jwt.decode(tokenString);
}

function getUserDataJWT(req){
    return decodeJWT(req).user
}

function compileQueryJWT(req, q, alias){
    let userData = getUserDataJWT(req);
    if(userData.GroupBasedServices){
        q.where(`${alias}.GroupID = '${userData.GroupID}'`);
    } else {
        q.where(`${alias}.CompanyID = '${userData.CompanyID}'`);
    }
    return q.compile();
}
  
module.exports = {
    decodeJWT: decodeJWT,
    getUserDataJWT: getUserDataJWT,
    compileQueryJWT: compileQueryJWT
}