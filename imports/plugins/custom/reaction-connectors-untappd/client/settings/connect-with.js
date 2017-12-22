Accounts.oauth.tryConnectAfterPopupClosed = function (credentialToken, callback) {
  var credentialSecret = Package["oauth"].Oauth._retrieveCredentialSecret(credentialToken) || null;
  var options = {
    oauth: {
      credentialToken: credentialToken,
      credentialSecret: credentialSecret
    }
  };
  Meteor.call("addLoginService", options, function (error) {
    if (callback) {
      callback(error);
    }
  });
};

Accounts.oauth.connectCredentialRequestCompleteHandler = function (callback) {
  return function (credentialTokenOrError) {
    if (credentialTokenOrError && credentialTokenOrError instanceof Error) {
      if (callback) {
        callback(credentialTokenOrError);
      }
    } else {
      Accounts.oauth.tryConnectAfterPopupClosed(credentialTokenOrError, callback);
    }
  };
};

var capitalize = function (word) {
  return word[0].toUpperCase() + word.slice(1);
};

Meteor.connectWith = function (service, options, callback) {
  // Support a callback without options
  if (!callback && typeof options === "function") {
    callback = options;
    options = null;
  }

  var connectCredentialRequestCompleteCallback =
    Accounts.oauth.connectCredentialRequestCompleteHandler(callback);

  var Service = service;
  if (typeof service === "string") {
    Service = Package[service][capitalize(service)];
  }
  Service.requestCredential(options, connectCredentialRequestCompleteCallback);
};

Meteor.connectWithUntappd = function (options, callback) {
  const untappdService = Package["brewline:accounts-untappd"].Untappd;

  return this.connectWith(untappdService, options, callback);
};
