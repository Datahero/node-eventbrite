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
function eventbriteAPI_v3 (apiKey, accessToken, options) {

  if (!options) {
    options = {};
  }

  this.version     = 'v3';
  this.apiKey      = apiKey;
  this.accessToken = accessToken || '';
  this.secure      = options.secure || false;
  this.packageInfo = options.packageInfo;
  this.httpUri     = (this.secure) ? 'https://www.eventbriteapi.com' : 'https://www.eventbriteapi.com';
  this.userAgent   = options.userAgent+' ' || '';
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
    uri : this.httpUri + '/' + this.version + '/' + resource + '/' + method + "?api_key=" + this.apiKey,
    method: 'POST',
    //headers : { 'User-Agent' : this.userAgent+'node-eventbrite/'+this.packageInfo.version },
    headers : { 'Authorization' : 'bearer ' + this.accessToken,
                'Content-Type' : 'application/json' },
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
 * Retrieves a paged list of respondents for a given survey and optionally collector
 * 
 * @see https://developer.eventbrite.com/mashery/get_respondent_list
 */
eventbriteAPI_v3.prototype.userDetails = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('users', 'me', [], params, callback);
};