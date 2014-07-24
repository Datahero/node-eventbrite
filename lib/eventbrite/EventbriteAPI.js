var eventbriteAPI_v3 = require('./eventbriteAPI_v3');

/**
 * Returns a eventbrite API wrapper object of the specified version. Only version v3
 * is currently supported
 * 
 * Available options are:
 *  - version   The API version to use (v3). Defaults to v3.
 *  - secure    Whether or not to use secure connections over HTTPS 
 *              (true/false). Defaults to false.
 *  - userAgent Custom User-Agent description to use in the request header. 
 * 
 * @param apiKey The API key to access the eventbrite API with
 * @param accessToken The oAuth accesstoken if already completed for the user, or null if not
 * @param options Configuration options as described above
 * @return Instance of the eventbrite API in the specified version
 */
function eventbriteAPI (apiKey, accessToken, options) {

  if (!options) {
    options = {};
  }

  if (!apiKey) {
    throw new Error('You have to provide an API key for this to work.');
  }

  options.packageInfo = {
    "version" : "v3"
  };

  if (!options.version || options.version === 'v3') {
    return new eventbriteAPI_v3(apiKey, accessToken, options);
  } else {
    throw new Error('Version ' + options.version + ' of the eventbrite API is currently not supported.');
  }

}

module.exports = eventbriteAPI;