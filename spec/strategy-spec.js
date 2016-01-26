var sinon = require('sinon'),
	constants = require('../constants');

require('jasmine-sinon');

var DummyOAuth2 = function () {
	this.get = sinon.spy();
	this.useAuthorizationHeaderforGET = sinon.spy();
};

var DummyStrategy = function () {

	this._arguments = Array.prototype.slice.call(arguments);

	this.isInherited = true;

	this.parentConstructor = sinon.spy();
	this.parentConstructor.apply(this, this._arguments);

	this.parentAuthenticate = sinon.spy();
	this._oauth2 = new DummyOAuth2();
};

DummyStrategy.prototype.authenticate = function () {
	this._arguments = Array.prototype.slice.call(arguments);
	this.parentAuthenticate.apply(this, arguments);
};

describe('EVE Online OAuth Strategy', function () {
	'use strict';

	var clientID,
		clientSecret,
		callbackURL,
		verify,
		strategy,
		constructorOptions,
		oAuth2Verify;

	var EveOnlineStrategy = require('../strategy')(DummyStrategy);

	beforeEach(function () {
		clientID = 12345;
		clientSecret = 'deadbeefbaadf00d';
		callbackURL = 'https://dead.beef/bad/f00d';
		verify = sinon.spy();
		strategy = new EveOnlineStrategy({
			clientID: clientID,
			clientSecret: clientSecret,
			callbackURL: callbackURL
		},
		verify);
		constructorOptions = strategy.parentConstructor.args[0][0];
		oAuth2Verify = strategy.parentConstructor.args[0][1];
	});

	it('it should be named \'eveonline\'', function () {
		expect(strategy.name).toEqual('eveonline');
	});

	it ('must inherit from passport-oauth2 strategy', function () {
		expect(strategy instanceof DummyStrategy).toBeTruthy();
	});

	it ('must not have an attribute named \'_verify\'', function () {
		expect(strategy._verify).toBeFalsy();
	});

	it ('should use the authorization header for get requests', function () {
		expect(strategy._oauth2.useAuthorizationHeaderforGET).toHaveBeenCalledWith(true);
	});

	describe('when created with defaults', function () {

		it('should invoke the base strategy constructor', function () {
			expect(strategy.parentConstructor).toHaveBeenCalled();
		});

		it('should pass authorizationURL to the base strategy constructor', function () {
			expect(constructorOptions.authorizationURL).toBeDefined();
			expect(constructorOptions.authorizationURL).toEqual(constants.defaultAuthorizationURL);
		});

		it('should pass tokenURL to the base strategy constructor', function () {
			expect(constructorOptions.tokenURL).toBeDefined();
			expect(constructorOptions.tokenURL).toEqual(constants.defaultTokenURL);
		});

		it('should pass clientID to the base strategy constructor', function () {
			expect(constructorOptions.clientID).toBeDefined();
			expect(constructorOptions.clientID).toEqual(clientID);
		});

		it('should pass clientSecret to the base strategy constructor', function () {
		      expect(constructorOptions.clientSecret).toBeDefined();
		      expect(constructorOptions.clientSecret).toEqual(clientSecret);
		});

		it('should pass callbackURL to the base strategy constructor', function () {
			expect(constructorOptions.callbackURL).toBeDefined();
			expect(constructorOptions.callbackURL).toEqual(callbackURL);
		});

		it('should pass a verify function to the base strategy constructor', function () {
			expect(typeof oAuth2Verify).toEqual('function');
		});
	});

	describe('when constructing with custom URLs', function () {
		var customAuthorizationURL,
			customTokenURL;

	    beforeEach(function () {
	    	customAuthorizationURL = 'custom authorization URL';
		    customTokenURL = 'custom token URL';
		    strategy = new EveOnlineStrategy({
		        clientID: clientID,
		        clientSecret: clientSecret,
		        callbackURL: callbackURL,
		        authorizationURL: customAuthorizationURL,
		        tokenURL: customTokenURL
		    },
		    verify);
		    constructorOptions = strategy.parentConstructor.args[0][0];
	    });

		it('should use the authorizationURL property provided', function () {
			expect(constructorOptions.authorizationURL).toBeDefined();
			expect(constructorOptions.authorizationURL).toEqual(customAuthorizationURL);
		});

    	it('should use the tokenURL property provided', function () {
      		expect(constructorOptions.tokenURL).toBeDefined();
      		expect(constructorOptions.tokenURL).toEqual(customTokenURL);
      	});
    });

	describe('when constructing without a callbackURL', function () {
	    it('should throw an exception', function () {
        	expect(function () {
        		new EveOnlineStrategy({
		       		clientID: clientID,
		          	clientSecret: clientSecret
		      	},
	          	verify);
        	}).toThrow();
		});
	});

	describe('when authenticating', function () {
		var request,
			authenticateOptions;

	    beforeEach(function () {
	      	request = 'request';
	      	authenticateOptions = {some: 'options'};
	      	strategy.authenticate(request, authenticateOptions);
	      });

    	it('should invoke the base authenticate function', function () {
      		expect(strategy.parentAuthenticate)
      			.toHaveBeenCalledWith(request, authenticateOptions);
      	});
    });

    describe('when verifying', function () {
    	var oAuth2VerifyDone,
    		profile;

    	beforeEach(function () {
			oAuth2VerifyDone = 'done callback';
			profile = 'profile';
			oAuth2Verify.call(
				strategy,
				'access token',
				'refresh token',
				profile,
				oAuth2VerifyDone);
		});

		it('translates passport-oauth2 verifications', function () {
			expect(verify).toHaveBeenCalledWith(profile, oAuth2VerifyDone);
		});
    });

    describe('when building character information with defaults', function () {

    	var accessToken,
			userProfileCallback,
			oAuth2Get,
			oAuth2GetCallback;

	    beforeEach(function () {
	    	accessToken = 'deadbeef';
			userProfileCallback = sinon.spy();
			strategy.userProfile(accessToken, userProfileCallback);
			oAuth2Get = strategy._oauth2.get.args[0];
			oAuth2GetCallback = oAuth2Get[2];
	    });
	      
    	it('should fetch character information using the protected _oauth2 object', function () {
			expect(oAuth2Get[0]).toEqual(constants.defaultVerifyURL);
			expect(oAuth2Get[1]).toEqual(accessToken);
			expect(typeof oAuth2GetCallback).toEqual('function');
		});

		describe('when called back with character information', function () {

	    	var expectedProfile,
	    		characterInformation;

	      	beforeEach(function () {
	        	expectedProfile = {
					CharacterID: 54321,
					CharacterName: 'Kooky Kira',
					ExpiresOn: 'Some Expiration Date',
					Scopes: 'some scopes',
					TokenType: 'Character',
					CharacterOwnerHash: 'beefdeadbad'
				};

		        oAuth2GetCallback(null, JSON.stringify(expectedProfile), null);
		        characterInformation = userProfileCallback.args[0][1];
		    });

	      	it('should not return an error', function () {
	      		expect(userProfileCallback.args[0][0]).toBeDefined();
	        	expect(userProfileCallback.args[0][0]).toBeNull();
	        });

	      	it('should provide exactly what was given by the EVE API', function () {
	      		expect(userProfileCallback).toHaveBeenCalledWith(null, expectedProfile);
	      	});
		});

		describe('when called back with an error in the JSON response', function () {

			var expectedError,
				error;

			beforeEach(function () {
				expectedError = {
			  		error: 'invalid_token',
			  		error_description: 'The authorization header is not set'
			  	};
				oAuth2GetCallback(null, JSON.stringify(expectedError));
				error = userProfileCallback.args[0][0];
			});
			
			it('should callback with a VerificationError', function () {
				expect(error.code).toEqual(expectedError.error);
				expect(error.description).toEqual(expectedError.error_description);
			});
		});

    	describe('when called back with a mal-formed JSON body', function () {

    		var error;

      		beforeEach(function () {
  				oAuth2GetCallback(null, 'a bad body', null);
        		error = userProfileCallback.args[0][0];
      		});

      		it('should catch exceptions and callback with an error', function () {
          		expect(error).toBeDefined();
          		expect(error).not.toBeNull();
          	});
      	});

    	describe('when called back with an error', function () {

    		var innerError,
    			error;

    		beforeEach(function () {
				innerError = new Error('some error');
		        oAuth2GetCallback(innerError);
		        error = userProfileCallback.args[0][0];
    		});

    		it('should callback with an InternalOAuthError', function () {
    			expect(error.name).toEqual('InternalOAuthError');
    			expect(error.message).toEqual(constants.fetchCharacterInformationError);
       			expect(error.oauthError).toEqual(innerError);
    		});
    	});
    });
});