/* Copyright (C) 2016 Canonical Ltd. */

var module = module;

(function (exports) {
  'use strict';

  var jujulib = exports.jujulib;

  /**
    Romulus terms service client.

    Provides access to the Romulus terms API.
  */

  var termsAPIVersion = 'v1';

  /**
    Initializer.

    @function terms
    @param url {String} The URL of the Romulus terms instance, including
      scheme and port, and excluding the API version.
    @param bakery {Object} A bakery object for communicating with the terms
      instance.
    @returns {Object} A client object for making Romulus terms API calls.
  */
  function terms(url, bakery) {
    // Store the API URL (including version) handling missing trailing slash.
    this.url = url.replace(/\/?$/, '/') + termsAPIVersion;
    this.bakery = bakery;
  };

  terms.prototype = {
    /**
      Show details on a terms of service entity.

      @public showTerms
      @params name {String} The terms name.
      @params revision {String or Int} The optional terms revision. If not
        provided, details on the most recent revision are returned.
      @params callback {Function} A callback to handle errors or accept the
        data from the request. Must accept an error message or null as its
        first parameter and the terms data as its second. The terms data
        includes the following fields:
          - name: the terms name, like "canonical";
          - title: an optional more human friendly title, or an empty string;
            if the title is not present clients could fall back to the name;
          - revision: the terms revision, as a positive number;
          - content: a text describing the terms;
          - createdAt: a date object with the terms creation time.
        If the terms is not found, the second argument is null.
    */
    showTerms: function(name, revision, callback) {
      var handler = function(error, response) {
        if (error !== null) {
          callback(error, null);
          return;
        }
        if (!response.length) {
          callback(null, null);
          return;
        }
        var terms = response[0];
        var milliseconds = Date.parse(terms['created-on']);
        callback(null, {
          name: terms.name,
          title: terms.title,
          revision: terms.revision,
          content: terms.content,
          createdAt: new Date(milliseconds)
        });
      };
      var url = this.url + '/terms/' + name;
      if (revision === 0 || revision) {
        url += '?revision=' + revision;
      }
      return jujulib._makeRequest(this.bakery, url, 'GET', null, handler);
    }

  };

  // Populate the library with the API client and supported version.
  jujulib.terms = terms;
  jujulib.termsAPIVersion = termsAPIVersion;

}((module && module.exports) ? module.exports : this));
