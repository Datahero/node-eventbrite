var http = require('http'),
    request = require('request'),
    helpers = require('./helpers');

/**
 * eventbrite API wrapper for the API version 3. This object should not be 
 * instantiated directly but by using the version wrapper {@link eventbriteAPI}.
 * 
 * @param apiKey The API key to access the eventbrite API with
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
  this.httpUri     = 'https://www.eventbriteapi.com'
  this.token       = options.token;
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
eventbriteAPI_v3.prototype.execute = function (resource, method, availableParams, givenParams, callback) {

  var finalParams = {};
  var currentParam;

  for (var i = 0; i < availableParams.length; i++) {
    currentParam = availableParams[i];
    if (typeof givenParams[currentParam] !== 'undefined')
      finalParams[currentParam] = givenParams[currentParam];
  }

  request({
    uri : this.httpUri + '/' + this.version + '/' + resource + '/' + method,
    method: 'POST',

    headers : { 'Authorization' : 'bearer ' + this.token,
                'Content-Type' : 'application/json',
                'User-Agent' : this.userAgent},
    body : JSON.stringify(finalParams)
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

  this.execute('users', params.id, availableParams, params, callback);
};


/**
 * Retrieves the current authenticated user
 *
 * @see http://developer.eventbrite.com/docs/user-details/
 **/

eventbriteAPI_v3.prototype.me = function (callback) {
  this.userDetails({id: 'me'}, callback);
};