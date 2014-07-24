# node-eventbrite

A node.js library for the eventbrite API

_node-eventbrite_ exposes the following features of the eventbrite API to your node.js application:
 
 * eventbrite API (Versions v3)

Further information on the eventbrite API and its features is available at [https://developer.eventbrite.com](https://developer.eventbrite.com)

## Installation

Installing using npm (node package manager):

    npm install node-eventbrite
    
If you don't have npm installed or don't want to use it:

    cd ~/.node_libraries
    git clone git@github.com:Datahero/node-eventbrite.git

Please note that parts of _node-eventbrite_ depend on [request](http://github.com/mikeal/request) by [Mikeal Rogers](http://github.com/mikeal). This library needs to be installed for the API to work. Additionally [node-querystring](http://github.com/visionmedia/node-querystring) is required. If you are using npm all dependencies should be automagically resolved for you.

## Usage

Information on how to use the eventbrite APIs can be found below. Further information on the API methods available can be found at [https://developer.eventbrite.com](https://developer.eventbrite.com). You can also find further information on how to obtain an API key, and/or OAuth2 in your eventbrite account and much more on the eventbrite API pages.

### eventbrite API

_eventbriteAPI_ takes two arguments. The first argument is your API key, which you can find in your eventbrite Account. The second argument is an options object which can contain the following options:

 * `version` The API version to use. Defaults to v3.
 * `secure` Whether or not to use secure connections over HTTPS (true/false). Defaults to false.
 * `userAgent` Custom User-Agent description to use in the request header.
 
The callback function for each API method gets two arguments. The first one is an error object which is null when no error occured, the second one an object with all information retrieved as long as no error occured.

Example:

```javascript
var eventbriteAPI = require('eventbrite').eventbriteAPI;

var apiKey = 'Your eventbrite API Key';

try { 
    var api = new eventbriteAPI(apiKey, { version : 'v3', secure : false });
} catch (error) {
    console.log(error.message);
}

api.user.owned_events({ id: 30 }, function (error, data) {
    if (error)
        console.log(error.message);
    else
        console.log(JSON.stringify(data)); // Do something with your data!
});

```
  
## License

_node-eventbrite_ is licensed under the MIT License. (See LICENSE) 
