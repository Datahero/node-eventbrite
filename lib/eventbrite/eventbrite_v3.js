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
        "Authorization": 'Bearer ' + this.token,
        "User-Agent": this.userAgent
    };

    if (verb === "POST") {
        headers["Content-Type"] = this.contentType;
    }

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
          return callback(helpers.createEventbriteError(parsedResponse));
        }
      } catch (error) {
        if (this.DEBUG)console.log("error", error);
        return callback(new Error('Error parsing JSON answer from eventbrite API.'));
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

eventbriteAPI_v3.prototype.delete = function (resource, method, availableParams, givenParams, callback) {
  this.execute("DELETE", resource, method, availableParams, givenParams, callback)
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
    "continuation", //string returned by the server that the client is expected to include in the next request to get the next page of results
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

  var method = params.event_id;
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
  // Optionally pass an attendee_id to provide results for a single attendee
  // params.attendee_id -> will return results for /events/:id/attendees/:attendee_id/

  var availableParams = [
    "page",
    "continuation",
    "status",
    "changed_since",
    "expand"
  ];
  var method = params.event_id + "/attendees/";
  
  if(params.attendee_id){
    method += params.attendee_id;
  }
 
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
    "continuation",
    "status",
    "changed_since",
    "expand"
  ];

  var method = params.event_id + "/orders/";
  this.get('events', method, availableParams, params, callback);
};

/**
 * Create a new event
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-post-events
 **/
eventbriteAPI_v3.prototype.create_event = function (params, callback) {
  var availableParams = [
    "event.name.html", //The name of the event. Value cannot be empty nor whitespace.
    "event.description.html", //The description on the event page
    "event.organizer_id", //The ID of the organizer of this event
    "event.start.utc",  //The start time of the event
    "event.start.timezone", //Start time timezone (Olson format)}
    "event.end.utc", //The end time of the event, timezone: End time timezone (Olson format)}
    "event.end.timezone", //End time timezone (Olson format)}
    "event.hide_start_date", //Whether the start date should be hidden
    "event.hide_end_date", //Whether the end date should be hidden
    "event.currency", //Event currency (3 letter code)
    "event.venue_id", //The ID of a previously-created venue to associate with this event. You can omit this field or set it to null if you set online_event.
    "event.online_event", //Is the event online-only (no venue)?
    "event.listed", //If the event is publicly listed and searchable. Defaults to True.
    "event.logo_id", //The logo for the event
    "event.category_id", //The category (vertical) of the event
    "event.subcategory_id", //The subcategory of the event (US only)
    "event.format_id", //The format (general type) of the event
    "event.shareable", //If users can share the event on social media
    "event.invite_only", //Only invited users can see the event page
    "event.password", //Password needed to see the event in unlisted mode
    "event.capacity", //	Set specific capacity (if omitted, sums ticket capacities)
    "event.show_remaining", //If the remaining number of tickets is publicly visible on the event page
    "event.source", //	Source of the event (defaults to API)
  ];

  if (!params["event.name.html"]) {
    return callback("This request requires a name", null)
  } else if (!params["event.start.utc"]) {
    return callback("This request requires a start.utc", null)
  } else if (!params["event.start.timezone"]) {
    return callback("This request requires a start.timezone", null)
  } else if (!params["event.end.utc"]) {
    return callback("This request requires an end.utc", null)
  } else if (!params["event.end.timezone"]) {
    return callback("This request requires an end.timezone", null)
  } else if (!params["event.currency"]) {
    return callback("This request requires a currency", null)
  } else if (!params["event.venue_id"] && !params["event.online_event"]) {
    return callback("This request requires an venue_id or online_event to be true", null)
  }
  
  this.post('events', null, availableParams, params, callback);
};


/**
 * Update event
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-post-events-id
 **/
eventbriteAPI_v3.prototype.update_event = function (params, callback) {
  if (!params.event_id && !params["event.id"]) {
    return callback("This request requires an event_id or event.id", null)
  }

  params.event_id = params.event_id || params["event.id"]

  var availableParams = [
    "event.name.html", //The name of the event. Value cannot be empty nor whitespace.
    "event.description.html", //The description on the event page
    "event.organizer_id", //The ID of the organizer of this event
    "event.start.utc",  //The start time of the event
    "event.start.timezone", //Start time timezone (Olson format)}
    "event.end.utc", //The end time of the event, timezone: End time timezone (Olson format)}
    "event.end.timezone", //End time timezone (Olson format)}
    "event.hide_start_date", //Whether the start date should be hidden
    "event.hide_end_date", //Whether the end date should be hidden
    "event.currency", //Event currency (3 letter code)
    "event.venue_id", //The ID of a previously-created venue to associate with this event. You can omit this field or set it to null if you set online_event.
    "event.online_event", //Is the event online-only (no venue)?
    "event.listed", //If the event is publicly listed and searchable. Defaults to True.
    "event.logo_id", //The logo for the event
    "event.category_id", //The category (vertical) of the event
    "event.subcategory_id", //The subcategory of the event (US only)
    "event.format_id", //The format (general type) of the event
    "event.shareable", //If users can share the event on social media
    "event.invite_only", //Only invited users can see the event page
    "event.password", //Password needed to see the event in unlisted mode
    "event.capacity", //	Set specific capacity (if omitted, sums ticket capacities)
    "event.show_remaining", //If the remaining number of tickets is publicly visible on the event page
    "event.source", //	Source of the event (defaults to API)
  ];

  var method = params.event_id;

  this.post('events', method, availableParams, params, callback);
};


/**
 * Delete event by id
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-delete-events-id
 **/

eventbriteAPI_v3.prototype.delete_event = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }

  var method = params.event_id;
  this.delete('events', method, [], [], callback);
};


/**
 * get tickets by event id
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-get-events-id-ticket-classes
 **/
eventbriteAPI_v3.prototype.event_ticket_classes = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }
  var availableParams = [
    "pos"
  ];

  var method = params.event_id + "/ticket_classes/";

  this.get('events', method, availableParams, params, callback);
};

/**
 * create an event ticket
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-post-events-id-ticket-classes
 **/
eventbriteAPI_v3.prototype.create_event_ticket_classes = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }
  var availableParams = [
    "ticket_class.name", 	//Name of this ticket type
    "ticket_class.description",	//Description of the ticket
    "ticket_class.quantity_total",	//Total available number of this ticket
    "ticket_class.cost",	//Cost of the ticket (currently currency must match event currency) e.g. $45 would be ‘USD,4500’
    "ticket_class.donation",	//Is this a donation? (user-supplied cost)
    "ticket_class.free",	//Is this a free ticket?
    "ticket_class.include_fee",	//Absorb the fee into the displayed cost
    "ticket_class.split_fee", //Absorb the payment fee, but show the eventbrite fee
    "ticket_class.hide_description",	//Hide the ticket description on the event page
    "ticket_class.sales_channels",	//A list of all supported sales channels ([“online”], [“online”, “atd”], [“atd”])
    "ticket_class.sales_start",	//When the ticket is available for sale (leave empty for ‘when event published’)
    "ticket_class.sales_end",	//When the ticket stops being on sale (leave empty for ‘one hour before event start’)
    "ticket_class.sales_start_after",	//The ID of another ticket class - when it sells out, this class will go on sale.
    "ticket_class.minimum_quantity",	//Minimum number per order
    "ticket_class.maximum_quantity",	//Maximum number per order (blank for unlimited)
    "ticket_class.auto_hide",	//Hide this ticket when it is not on sale
    "ticket_class.auto_hide_before",	//Override reveal date for auto-hide
    "ticket_class.auto_hide_after", //Override re-hide date for auto-hide
    "ticket_class.hidden",	//Hide this ticket
    "ticket_class.order_confirmation_message", //Order message per ticket type
  ];

  var method = params.event_id + "/ticket_classes/";

  this.post('events', method, availableParams, params, callback);
};

/**
 * Update an event ticket
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-post-events-id-ticket-classes
 **/
eventbriteAPI_v3.prototype.update_event_ticket_classes = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  } else if (!params.ticket_class_id) {
    return callback("This request requires an ticket_class_id", null)
  }
  
  var availableParams = [
    "ticket_class.name", 	//Name of this ticket type
    "ticket_class.description",	//Description of the ticket
    "ticket_class.quantity_total",	//Total available number of this ticket
    "ticket_class.cost",	//Cost of the ticket (currently currency must match event currency) e.g. $45 would be ‘USD,4500’
    "ticket_class.donation",	//Is this a donation? (user-supplied cost)
    "ticket_class.free",	//Is this a free ticket?
    "ticket_class.include_fee",	//Absorb the fee into the displayed cost
    "ticket_class.split_fee", //Absorb the payment fee, but show the eventbrite fee
    "ticket_class.hide_description",	//Hide the ticket description on the event page
    "ticket_class.sales_channels",	//A list of all supported sales channels ([“online”], [“online”, “atd”], [“atd”])
    "ticket_class.sales_start",	//When the ticket is available for sale (leave empty for ‘when event published’)
    "ticket_class.sales_end",	//When the ticket stops being on sale (leave empty for ‘one hour before event start’)
    "ticket_class.sales_start_after",	//The ID of another ticket class - when it sells out, this class will go on sale.
    "ticket_class.minimum_quantity",	//Minimum number per order
    "ticket_class.maximum_quantity",	//Maximum number per order (blank for unlimited)
    "ticket_class.auto_hide",	//Hide this ticket when it is not on sale
    "ticket_class.auto_hide_before",	//Override reveal date for auto-hide
    "ticket_class.auto_hide_after", //Override re-hide date for auto-hide
    "ticket_class.hidden",	//Hide this ticket
    "ticket_class.order_confirmation_message", //Order message per ticket type
  ];

  var method = params.event_id + "/ticket_classes/" + params.ticket_class_id + "/";

  this.post('events', method, availableParams, params, callback);
};

/**
 * Publish event
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-post-events-id-publish
 **/

eventbriteAPI_v3.prototype.publish_event = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }

  var method = params.event_id + "/publish/";
  this.post('events', method, [], [], callback);
};

/**
 * Unpublish event
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/events/#ebapi-post-events-id-unpublish
 **/

eventbriteAPI_v3.prototype.unpublish_event = function (params, callback) {
  if (!params.event_id) {
    return callback("This request requires an event_id", null)
  }

  var method = params.event_id + "/unpublish/";
  this.post('events', method, [], [], callback);
};


/*****************************************************************************/
/************************* MEDIA Related Methods **************************/
/*****************************************************************************/

/**
 * Get media upload data
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/media/#ebapi-get-media-upload
 **/

eventbriteAPI_v3.prototype.upload_instructions = function (params, callback) {
  if (!params.type) {
    return callback("This request requires an type", null)
  }

  var availableParams = [
    "type"
  ]

  this.get('media', 'upload', availableParams, params, callback);
};

/**
 * Get uploaded media details
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/media/#ebapi-get-media-upload
 **/

eventbriteAPI_v3.prototype.upload_media = function (params, callback) {
  if (!params.upload_token) {
    return callback("This request requires an upload_token", null)
  }

  var availableParams = [
    "upload_token"
  ]

  this.post('media', 'upload', availableParams, params, callback);
};

/**
 * Get media details
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/media/#ebapi-media
 **/

eventbriteAPI_v3.prototype.media_details = function (params, callback) {
  if (!params.media_id) {
    return callback("This request requires an media_id", null)
  }

  var method = params.media_id;
  this.get('media', method, [], [], callback);
};



/*****************************************************************************/
/************************* Venue Related Methods **************************/
/*****************************************************************************/

/**
 * Create a new venue
 *
 * @see https://www.eventbrite.com/developer/v3/endpoints/venues/#ebapi-post-venues
 **/

eventbriteAPI_v3.prototype.create_venue = function (params, callback) {
  if (!params["venue.name"]) {
    return callback("This request requires a venue.name", null)
  }

  var availableParams = [
    "venue.name", //  The name of the venue
    "venue.organizer_id",	// The organizer this venue belongs to (optional - leave this off to use the default organizer)
    "venue.address.address_1", // The first line of the address
    "venue.address.address_2", // The second line of the address
    "venue.address.city",	// The city where the venue is
    "venue.address.region",	//	The region where the venue is
    "venue.address.postal_code", //	The postal_code where the venue is
    "venue.address.country", //	The country where the venue is
    "venue.address.latitude", //	The latitude of the coordinates for the venue
    "venue.address.longitude"	//	The longitude of the coordinates for the venue
  ]

  this.post('venues', null, availableParams, params, callback);
};

/**
 * Update venue by id
 *
 * @see https://www.eventbrite.com/developer/v3/response_formats/venue/#ebapi-std:format-venue
 **/

eventbriteAPI_v3.prototype.update_venue = function (params, callback) {
  if (!params.venue_id && !params["venue.id"]) {
    return callback("This request requires a venue_id or venue.id", null)
  }
  params.venue_id = params.event_id || params["venue.id"]

  var availableParams = [
    "venue.name", //  The name of the venue
    "venue.organizer_id",	// The organizer this venue belongs to (optional - leave this off to use the default organizer)
    "venue.address.address_1", // The first line of the address
    "venue.address.address_2", // The second line of the address
    "venue.address.city",	// The city where the venue is
    "venue.address.region",	//	The region where the venue is
    "venue.address.postal_code", //	The postal_code where the venue is
    "venue.address.country", //	The country where the venue is
    "venue.address.latitude", //	The latitude of the coordinates for the venue
    "venue.address.longitude"	//	The longitude of the coordinates for the venue
  ]

  var method = params.venue_id;
  this.post('venues', method, availableParams, params, callback);
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
    "continuation",
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
    "continuation",
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
    "continuation",
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
 * Retrieves events organizers for a given user_id
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

/*****************************************************************************/
/************************* WEB HOOK Related Methods **************************/
/*****************************************************************************/

//https://www.eventbrite.com/developer/v3/endpoints/webhooks/

/**
 * Returns a webhook for the specified webhook
 * if no webhook id provided, will return list of all webhooks that belong to the authenticated user
 * @see https://www.eventbrite.com/developer/v3/endpoints/webhooks/
 **/
eventbriteAPI_v3.prototype.webhooks = function (params, callback) {
  var webhook_id = params.webhook_id || "";

  var availableParams = [];

  var method = webhook_id;
  this.get('webhooks', method, availableParams, params, callback);
};

/**
 * Creates a new webhook for the authenticated user
 * @see https://www.eventbrite.com/developer/v3/endpoints/webhooks/
 **/
eventbriteAPI_v3.prototype.create_webhook = function (params, callback) {

  var availableParams = [
    "endpoint_url", //The target URL of the Webhook subscription.
    "actions", //Determines what actions will trigger the webhook.
    "event_id" //The ID of the event that triggers this webhook. Leave blank for all events.
  ];

  this.post('webhooks', '', availableParams, params, callback);
};

/**
 * Deletes a webhook 
 * @see https://www.eventbrite.com/developer/v3/endpoints/webhooks/
 **/
eventbriteAPI_v3.prototype.delete_webhook = function (params, callback) {
  if (!params.webhook_id && !params["webhook.id"]) {
    return callback("This request requires a webhook_id or webhook.id", null)
  }
  params.webhook_id = params.webhook_id || params["webhook.id"]

  var availableParams = [];

  var method = params.webhook_id;
  this.delete('webhooks', method, availableParams, params, callback);
};
