"use strict";
class TokenGenerator {
  static generate(digits = 6) {
    let token = Math.random()
      .toString()
      .slice(2, digits + 2);
    return token;
  }
  static uid() {
    var length = 14;
    let token = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      token += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return token;
  }
}

module.exports = TokenGenerator;
