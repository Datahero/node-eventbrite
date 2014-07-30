var eventbriteAPI_v3 = require('./eventbrite_v3');

/**
 * Returns a eventbrite API wrapper object of the specified version. Only version v3
 * is currently supported
 *
 * Required options are:
 *  - token     An authenticated users oAuth Token.
 * Available options are:
 *  - userAgent   a user agent you would like used in place of the default
 *  - version     The API version to use (v3). Defaults to v3.
 *
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
