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
function eventbriteAPI_v3(options) {

  if (!options) {
    throw new Error('Something went wrong, API requires: {token: YOUR_TOKEN}');
  } else if (!options.token) {
    throw new Error('You have to provide a token for this to work.');
  }

  this.version = 'v3';
  this.httpUri = 'https://www.eventbriteapi.com';
  this.token = options.token;
  this.DEBUG = options.DEBUG || false;
  this.contentType = options.contentType || 'application/json';
  this.userAgent = options.userAgent || 'node-eventbrite/' + this.version;
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
    "Authorization": 'Bearer ' + this.token,
    "User-Agent": this.userAgent
  };

  var uri = this.httpUri + '/' + this.version + '/' + resource + '/';

  // Fix to only add method if it is set, otherwise "null" is added
  if (method) {
    uri = uri + method + '/';
  }

  var finalParams = {};
  var currentParam;

  for (var i = 0; i < availableParams.length; i++) {
    currentParam = availableParams[i];
    if (typeof givenParams[currentParam] !== 'undefined')
      finalParams[currentParam] = givenParams[currentParam];
  }

  if (this.DEBUG) {
    console.log("uri", uri);
    console.log("verb", verb);
    console.log("headers", headers);
    console.log("finalParams", finalParams);
  }

  // Build our request object
  var requestObject = {
    uri: uri,
    method: verb,
    headers: headers
  };

  // Either add params to qs or body based on method
  if (verb === 'GET') {
    requestObject.qs = finalParams;
  } else if (resource === 'batch') {
    // application/json does not work for this endpoint, let's fix it
    requestObject.headers["Content-Type"] = 'application/x-www-form-urlencoded';
    requestObject.body = 'batch=' + encodeURIComponent(JSON.stringify(finalParams.batch));
  } else if (verb === 'POST') {
    requestObject.body = JSON.stringify(finalParams);
  }

  request(requestObject, function (error, response, body) {
    var parsedResponse;
    if (error) {
      if (this.DEBUG)console.log("error", error);
      var err = new Error('Unable to connect to the eventbrite API endpoint.');
      err.error_message = error;
      err.code = "REQUEST_ERROR";
      return callback(err);
    } else {

      try {
        parsedResponse = JSON.parse(body);
        if (parsedResponse.error){
          if (this.DEBUG)console.log("error", parsedResponse.error, parsedResponse.error_description);
          return callback(new Error(parsedResponse.error + '' + parsedResponse.error_description));
        }
      } catch (error) {
        if (this.DEBUG)console.log("error", error);
        return callback(new Error('Error parsing JSON answer from eventbrite API.'));
      }

      if (parsedResponse.error) {
        if (this.DEBUG)console.log("error", parsedResponse);
        return callback(helpers.createEventbriteError(parsedResponse));
      }

      return callback(null, parsedResponse);

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
/************************* EVENT Related Methods **************************/
/*****************************************************************************/


/**
 * This endpoint allows you to retrieve Event category options from across Eventbrite’s directory.
 *
 * @see http://developer.eventbrite.com/docs/event-search/
 **/
eventbriteAPI_v3.prototype.search = function (params, callback) {
  var availableParams = [
    "q", // Pass in a value for ‘q’ that is a query and will return events matching the given keyword(s).
    "since_id", //Pass in the last ‘Event ID’ to only return events that have been created after this Event ID.
    "sort_by", //Sort the list of events by “id”, “date”, “name”, “city”. The default is “date”.
    "popular", //[Boolean] Pass in ‘true’ to only receive a subset of events that have already sold a minimum threshold of tickets and received a minimum amount of social engagement.
    "location.address",  //The address of the location that you want to search around.
    "location.latitude", //The latitude of the location that you want to search around.
    "location.longitude", //The longitude of the location that you want to search around.
    "location.within", //The distance that you want to search around the given location. This should be an integer followed by “mi” or “km”.
    "venue.city", //Only return events that are located in the given city.
    "venue.region", //Only return events that are located in the given region.
    "venue.country", //Only return events that are located in the given country.
    "organizer.id", //Only return events that are organized by a specific Organizer.
    "user.id",  //Only return events that are organized by a specific User.
    "tracking_code", //Append the given tracking_code to the event URLs that are returned.
    "categories", //Only return events that are in a specific category — must pass in the category ID, not the name. To pass in multiple categories, list with a comma separator.
    "formats", //Only return events that are in a specific format. To pass in multiple formats, list with a comma separator.
    "start_date.range_start",  //Only return events with start dates after the given UTC date.
    "start_date.range_end", //Only return events with start dates before the given UTC date.
    "start_date.keyword", //Only return events with start dates within the given keyword date range. Valid options are “today”, “tomorrow”, “this_week”, “this_weekend”, “next_week”, and “this_month”.
    "date_created.range_start", //Only return events with date created after the given UTC date.
    "date_created.range_end", //Only return events with date created before the given UTC date.
    "date_created.keyword", //Only return events with date created within the given keyword date range. Valid options are “today”, “tomorrow”, “this_week”, “this_weekend”, “next_week”, and “this_month”.
    "date_modified.range_start", //Only return events with date_modified after the given UTC date.
    "date_modified.range_end", //Only return events with date_modified before the given UTC date.
    "date_modified.keyword", //Only return events with date_modified within the given keyword date range. Valid options are “today”, “tomorrow”, “this_week”, “this_weekend”, “next_week”, and “this_month”.
    "page", //To page through the responses, you set the page parameter to equal the intended page. So, amending “page=2” would return the second page of results.
    "expand" //Optional comma-separated expansions as specified here: https://www.eventbrite.com/developer/v3/formats/event/#ebapi-public-expansions
  ];

  this.get("events", "search", availableParams, params, callback);
};


/**
 * This endpoint allows you to retrieve Event category options from across Eventbrite’s directory.
 *
 * @see http://developer.eventbrite.com/docs/event-categories/
 **/
eventbriteAPI_v3.prototype.categories = function (callback) {
  this.get('categories', null, [], [], callback);
};


/**
 * This endpoint allows you to retrieve Event subcategory options from across Eventbrite’s directory.
 *
 * @see http://developer.eventbrite.com/docs/event-categories/
 **/
eventbriteAPI_v3.prototype.subcategories = function (params, callback) {
  var availableParams = [
    "page"
  ];

  this.get('subcategories', null, availableParams, params, callback);
};


/**
 * Retrieves details for a given event_id
 *
 * @see http://developer.eventbrite.com/docs/event-details/
 **/

eventbriteAPI_v3.prototype.event_details = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }

  var availableParams = [
    "status",
    "changed_since",
    "expand"
  ];

  var method = params.event_id + "/";
  this.get('events', method, availableParams, params, callback);
};


/**
 * Retrieves attendees for a given event_id
 *
 * @see http://developer.eventbrite.com/docs/event-attendees/
 **/

eventbriteAPI_v3.prototype.event_attendees = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }

  var availableParams = [
    "page",
    "status",
    "changed_since",
    "expand"
  ];
  var method = params.event_id + "/attendees/";
  this.get('events', method, availableParams, params, callback);
};


//[http://developer.eventbrite.com/docs/event-attendees-detail](Event Attendees’ Detail)

/**
 * Retrieves orders for a given event_id
 *
 * @see http://developer.eventbrite.com/docs/event-orders/
 **/

eventbriteAPI_v3.prototype.event_orders = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }

  var availableParams = [
    "page",
    "status",
    "changed_since",
    "expand"
  ];

  var method = params.event_id + "/orders/";
  this.get('events', method, availableParams, params, callback);
};

//[http://developer.eventbrite.com/docs/event-discounts](Event Discounts)
//[http://developer.eventbrite.com/docs/event-access-codes](Event Access Codes)
//[http://developer.eventbrite.com/docs/event-transfers](Event Transfers)
//[http://developer.eventbrite.com/docs/event-teams](Event Teams)
//[http://developer.eventbrite.com/docs/event-teams-details](Event Teams’ Details)
//[http://developer.eventbrite.com/docs/event-teams-attendees](Event Teams’ Attendees)


/*****************************************************************************/
/************************* USER Related Methods **************************/
/*****************************************************************************/


/**
 * Retrieves a user by ID
 *
 * @see http://developer.eventbrite.com/docs/user-details/
 **/
eventbriteAPI_v3.prototype.user_details = function (params, callback) {
  var user_id = params.user_id || "me",
    availableParams = [];

  var method = user_id + "/";

  this.get('users', method, availableParams, params, callback);
};


/**
 * Retrieves the current authenticated user
 *
 * @see http://developer.eventbrite.com/docs/user-details/
 **/
eventbriteAPI_v3.prototype.me = function (callback) {
  this.user_details({user_id: 'me'}, callback);
};


/**
 * Retrieves user_orders for a given user_id
 * If you do not include a user_id, we will include one for you :)
 * @see http://developer.eventbrite.com/docs/user-orders/
 **/
eventbriteAPI_v3.prototype.user_orders = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = ["page"];

  var method = user_id + "/orders/";
  this.get('users', method, availableParams, params, callback);
};


/**
 * Retrieves user_owned_events for a given user_id
 * If you do not include a user_id, we will include one for you :)
 * @see http://developer.eventbrite.com/docs/user-owned-events/
 **/
eventbriteAPI_v3.prototype.user_owned_events = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = [
    "page",
    "status",
    "order_by",
    "expand"
  ];

  var method = user_id + "/owned_events/";
  this.get('users', method, availableParams, params, callback);
};

/**
 * Retrieves user_events for a given user_id
 * Gets all the events a user has access not, not just the ones shes an organizer for
 * If you do not include a user_id, we will include one for you :)
 * @see https://www.eventbrite.com/developer/v3/endpoints/users/#ebapi-get-users-id-events
 **/
eventbriteAPI_v3.prototype.user_events = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = [
    "page",
    "status",
    "order_by",
    "expand"
  ];

  var method = user_id + "/events/";
  this.get('users', method, availableParams, params, callback);
};

/**
 * Retrieves user_owned_events_orders for a given user_id
 * If you do not include a user_id, we will include one for you :)
 * @see http://developer.eventbrite.com/docs/user-owned-events-orders/
 **/
eventbriteAPI_v3.prototype.user_owned_events_orders = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = ["page"];

  var method = user_id + "/owned_event_orders/";
  this.get('users', method, availableParams, params, callback);
};


/**
 * Retrieves user_owned_events_attendees for a given user_id
 * If you do not include a user_id, we will include one for you :)
 * @see http://developer.eventbrite.com/docs/user-owned-events-attendees/
 **/
eventbriteAPI_v3.prototype.user_owned_events_attendees = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = [
    "page",
    "expand"
  ];

  var method = user_id + "/owned_event_attendees/";
  this.get('users', method, availableParams, params, callback);
};


/**
 * Retrieves user_owned_venues for a given user_id
 * If you do not include a user_id, we will include one for you :)
 * @see http://developer.eventbrite.com/docs/user-venues/
 **/
eventbriteAPI_v3.prototype.user_venues = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = ["page"];

  var method = user_id + "/venues/";
  this.get('users', method, availableParams, params, callback);
};


/**
 * Retrieves user_owned_venues for a given user_id
 * If you do not include a user_id, we will include one for you :)
 * @see http://developer.eventbrite.com/docs/user-organizers/
 **/
eventbriteAPI_v3.prototype.user_organizers = function (params, callback) {
  var user_id = params.user_id || "me";

  var availableParams = ["page"];

  var method = user_id + "/organizers/";
  this.get('users', method, availableParams, params, callback);
};

/**
 * To save on the added latency of doing several API requests at once
 * especially in high-latency environments like mobile data - it’s possible to
 * do a batched request to the API and have our servers process all of your
 * requests at once, saving you the cost of several request round trips.
 * @see https://www.eventbrite.com/developer/v3/reference/batching/
 **/
eventbriteAPI_v3.prototype.batch = function (params, callback) {
  var availableParams = ["batch"];

  this.post('batch', null, availableParams, params, callback);
};

/*****************************************************************************/
/************************* ORDER Related Methods **************************/
/*****************************************************************************/

//http://developer.eventbrite.com/docs/order-details/


/*****************************************************************************/
/************************* CONTACT LISTS Related Methods **************************/
/*****************************************************************************/

//http://developer.eventbrite.com/docs/contact-lists/
//http://developer.eventbrite.com/docs/contact-list-details/
