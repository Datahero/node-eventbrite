var http = require('http'),
    request = require('request'),
    helpers = require('./helpers');

/**
 * eventbrite API wrapper for the API version 3. This object should not be
 * instantiated directly but by using the version wrapper {@link eventbriteAPI}.
 *
 * @param options Configuration options
 * @return Instance of {@link eventbriteAPI_v3}
 */
function eventbriteAPI_v3 (options) {

  if (!options) {
    throw new Error('Something went wrong, API requires: {token: YOUR_TOKEN}');
  } else if (!options.token) {
    throw new Error('You have to provide a token for this to work.');
  }

  this.version     = 'v3';
  this.httpUri     = 'https://www.eventbriteapi.com';
  this.token       = options.token;
  this.contentType = options.contentType || 'application/json';
  this.userAgent   = options.userAgent || 'node-eventbrite/' + this.version;
}

module.exports = eventbriteAPI_v3;

/**
 * Sends a given request as a JSON object to the eventbrite API and finally
 * calls the given callback function with the resulting JSON object. This
 * method should not be called directly but will be used internally by all API
 * methods defined.
 *
 * @param resource eventbrite API resource to call
 * @param method eventbrite API method to call
 * @param availableParams Parameters available for the specified API method
 * @param givenParams Parameters to call the eventbrite API with
 * @param callback Callback function to call on success
 */
eventbriteAPI_v3.prototype.execute = function (verb, resource, method, availableParams, givenParams, callback) {
  if (!verb) {
    verb = "GET";
  }
  var headers = {
    "Content-Type": this.contentType,
    "Authorization":  'Bearer ' + this.token,
    "User-Agent": this.userAgent
  };

  var uri = this.httpUri + '/' + this.version + '/' + resource + '/' + method;

  var finalParams = {};
  var currentParam;

  for (var i = 0; i < availableParams.length; i++) {
    currentParam = availableParams[i];
    if (typeof givenParams[currentParam] !== 'undefined')
      finalParams[currentParam] = givenParams[currentParam];
  }

  request({
    uri: uri,
    method: verb,
    headers: headers,
    body: JSON.stringify(finalParams)
  }, function (error, response, body) {
    var parsedResponse;
    if (error) {
      callback(new Error('Unable to connect to the eventbrite API endpoint.'));
    } else {

      try {
        parsedResponse = JSON.parse(body);
      } catch (error) {
        callback(new Error('Error parsing JSON answer from eventbrite API.'));
        return;
      }

      if (parsedResponse.errmsg) {
        callback(helpers.createEventbriteError(parsedResponse.errmsg, parsedResponse.status));
        return;
      }

      callback(null, parsedResponse);

    }
  });

};

eventbriteAPI_v3.prototype.get = function (resource, method, availableParams, givenParams, callback) {
  this.execute("GET", resource, method, availableParams, givenParams, callback)
};

eventbriteAPI_v3.prototype.post = function (resource, method, availableParams, givenParams, callback) {
  this.execute("POST", resource, method, availableParams, givenParams, callback)
};



/*****************************************************************************/
/************************* xxx Related Methods **************************/
/*****************************************************************************/

/**
 * Retrieves a user by ID
 *
 * @see http://developer.eventbrite.com/docs/user-details/
**/

eventbriteAPI_v3.prototype.userDetails = function (params, callback) {
  var availableParams = [];

  if (typeof params === 'function') callback = params, params = {};

  params.user_id = params.user_id || "me";

  this.get('users', params.user_id, availableParams, params, callback);
};


/**
 * Retrieves the current authenticated user
 *
 * @see http://developer.eventbrite.com/docs/user-details/
 **/

eventbriteAPI_v3.prototype.me = function (callback) {
  this.userDetails({user_id: 'me'}, callback);
};


/**
 * Retrieves user_owned_events for a given user_id
 * If you do not include a user_id, we will include one for you :)
 * @see http://developer.eventbrite.com/docs/user-details/
 **/

eventbriteAPI_v3.prototype.owned_events = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = [
    "page",
    "status",   //Pull a user’s events based upon the ‘status’ of the event. Potential request parameters are ‘all’, ‘draft’, ‘live’, ‘cancelled’, ‘started’, and ‘ended’.
    "order_by"  //Determine the order of a user’s events based upon the start date or creation date. Sort by ‘start_asc’, ‘start_desc’, ‘created_asc’, and ‘created_desc’.
  ];

  var method = user_id + "/owned_events/"
  this.get('users', method, availableParams, params, callback);
};
