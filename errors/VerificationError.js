(function() {
  var VerificationError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  VerificationError = (function(_super) {
    __extends(VerificationError, _super);

    function VerificationError(code, description) {
      this.code = code;
      this.description = description;
      VerificationError.__super__.constructor.call(this);
      Error.captureStackTrace(this, arguments.callee);
      this.name = 'VerificationError';
      if (code == null) {
        code = "server_error";
      }
      if (description == null) {
        description = "unable to verify login to obtain character information";
      }
      this.message = "" + code + ": " + description;
    }

    return VerificationError;

  })(Error);

  module.exports = VerificationError;

}).call(this);
