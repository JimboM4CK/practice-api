"use strict";
import Crypto from "crypto";
import Zxcvbn from "zxcvbn";

export default {
  validatePassword: function(password, salt, hash) {
    if (this.generateHash(password, salt) === hash) {
      return true;
    }
  },
  generateSalt: function() {
    let length = 64;
    return Crypto.randomBytes(Math.ceil(length / 2))
      .toString("hex") /** convert to hexadecimal format */
      .slice(0, length); /** return required number of characters */
  },
  generateHash: function(password, salt) {
    let length = 64;
    var hash = Crypto.createHmac(
      "sha512",
      salt
    ); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest("hex").slice(0, length);
  },
  isSecure: function(password) {
    return Zxcvbn(password);
  }
};
