var eventbriteAPI_v3 = require('./eventbriteAPI_v3');

/**
 * Returns a eventbrite API wrapper object of the specified version. Only version v3
 * is currently supported
 *
 * Available options are:
 *  - token     An authenticated users oAuth Token.
 *  - version   The API version to use (v3). Defaults to v3.
 *  - userAgent Custom User-Agent description to use in the request header.
 *
 * @param apiKey The API key to access the eventbrite API with
 * @param accessToken The oAuth accesstoken if already completed for the user, or null if not
 * @param options Configuration options as described above
 * @return Instance of the eventbrite API in the specified version
 */

var versions = {
  "v3": eventbriteAPI_v3
};

function eventbriteAPI (options) {
  if (!options) {
    throw new Error('All versions of the API require options. Please review https://github.com/Datahero/node-eventbrite/blob/master/README.md');
  }

  options.version = options.version || "v3"

  if (versions[options.version]) {
    return new versions[options.version](options);
  } else {
    throw new Error('Version ' + options.version + ' of the eventbrite API is currently not supported.');
  }

}

module.exports = eventbriteAPI;
