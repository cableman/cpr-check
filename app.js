#!/usr/bin/env node

/**
 * @file
 * Prototype web-crawler that checks pages for CPR numbers.
 */

var Crawler = require("crawler").Crawler;
var CPR = require("./cpr.js");

// Get parameters.
var argv = require('optimist').argv;
var domain = argv.domain;

var c = new Crawler({
  "maxConnections": 1,
  "cache": true,
  "skipDuplicates": true,

  // This will be called for each crawled page
  "callback": function(error, result, $) {
    if (result.body !== undefined) {

      console.log(result.options.uri);

      // Check body.
      CPR.checkString(result.body, (result.options.uri || 'No uri'));

      // $ is a jQuery instance scoped to the server-side DOM of the page
      if ($) {
        $('a').each(function(index, a) {
          // Check that we don't move outside the domain.
          if (~a.href.indexOf(domain)) {
            c.queue(a.href);
          }
        });
      }
    }
  }
});

// Queue URL given as input parameter.
console.log('Start checking: ' + argv.url);
c.queue(argv.url);
