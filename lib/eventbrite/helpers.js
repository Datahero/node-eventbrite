/**
 * Recursively encode an object as application/x-www-form-urlencoded.
 *
 * @param value Value to encode
 * @param key Key to encode (not required for top-level objects)
 * @return Encoded object
 */
exports.serialize = function (value, key) {

  var output;

  if (!key && key !== 0)
    key = '';

  if (Array.isArray(value)) {
    output = [];
    value.forEach(function (val, index) {
      if (key !== '') index = key + '[' + index + ']';
      output.push(serialize(val, index));
    }, this);
    return output.join('&');
  } else if (typeof(value) == 'object') {
    output = [];
    for (var name in value) {
      if (value[name] && value.hasOwnProperty(name)) {
        output.push(serialize(value[name], key !== '' ? key + '[' + name + ']' : name));
      }
    }
    return output.join('&');
  } else {
    return key + '=' + encodeURIComponent(value);
  }

};

/**
 * Creates an Error with information received from eventbrite.
 *
 * NOT_FOUND:
 *    The URL you gave is not valid. Status code 404.
 * INVALID_AUTH:
 *    Your authentication (usually OAuth token) is incorrect. Status code 400.
 * INVALID_AUTH_HEADER:
 *    Your Authentication header is malformed. Status code 400.
 * NO_AUTH:
 *    You did not provide any authentication at all. Status code 401.
 * BAD_PAGE:
 *    The page number you gave does not exist or makes no sense (e.g. negative). Status code 400.
 * NOT_AUTHORIZED:
 *    The user you are connecting as is not allowed to view/perform that action. Status code 403.
 * METHOD_NOT_ALLOWED:
 *    You sent a method to the endpoint it can't handle (e.g. DELETE to a GET-only endpoint). Status code 405.
 * HIT_RATE_LIMIT:
 *    You have hit your hourly rate limit to the API. Status code 429.
 * INTERNAL_ERROR:
 *    An unhandled error occured in Eventbrite. Contact developer support if this persists. Status code 500.
 * EXPANSION_FAILED:
 *    There was an unhandled error trying to expand one of the specified expansions; the request is likely
 *
 * @param {object} errorResponse A JSON error response @see https://www.eventbrite.com/developer/v3/reference/errors/
 * @return Instance of {@link Error}
 */


exports.createEventbriteError = function (errorResponse) {
  if (!errorResponse.error) {
    return new Error('Unable to parse eventbrite error');
  }

  var message,
      extra;

  if (errorResponse.hasOwnProperty('error_description')) {
    message = errorResponse.error_description;
  } else {
    message = 'Unknown error message from eventbrite: ';

    try {
      extra = JSON.stringify(errorResponse);
      message += extra;
    } catch (error) {
      message += 'Could not stringify error response from eventbrite';
    }
  }

  var error = new Error(message);

  if (errorResponse.error) {
    error.code = errorResponse.error;
    error.status_code = errorResponse.status_code;
  }

  return error;
};
