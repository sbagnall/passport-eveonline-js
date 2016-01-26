(function() {
  var EveOnlineStrategyWithInjectedParent, OAuth2Strategy;

  OAuth2Strategy = require('passport-oauth2');

  EveOnlineStrategyWithInjectedParent = require('./strategy')(OAuth2Strategy);

  module.exports = EveOnlineStrategyWithInjectedParent;

}).call(this);
