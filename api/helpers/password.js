'use strict;'
var crypto = require('crypto');
var zxcvbn = require('zxcvbn');

function generateSalt(){
    let length = 128;
    return crypto.randomBytes(Math.ceil(length/2))
      .toString('hex') /** convert to hexadecimal format */
      .slice(0,length);   /** return required number of characters */
}

function generateHash(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest('hex');
}

function validatePassword(password){
    return zxcvbn(password);
}

module.exports = {
    generateSalt: generateSalt,
    generateHash: generateHash,
    validatePassword: validatePassword
}
