#!/usr/bin/env node

/**
 * @file
 * Prototype web-crawler that checks pages for CPR numbers.
 */

var Crawler = require("crawler").Crawler;

// Get parameters.
var argv = require('optimist').argv;
var domain = argv.domain;

var CPR = require('./lib/cpr');
var cpr = new CPR();

var files = [ 'pdf', 'docx', 'doc'];

var c = new Crawler({
  "maxConnections": 1,
  "cache": true,
  "skipDuplicates": true,

  // This will be called for each crawled page
  "callback": function(error, result, $) {
    if (result.body !== undefined) {
      // Check body.
      var results = cpr.checkString(result.body, (result.options.uri || 'No uri'));
      cpr.printResult(results);

      // $ is a jQuery instance scoped to the server-side DOM of the page
      if ($) {
        $('a').each(function(index, a) {
          var url = a.href;

          // Check if URL has a known file extension.
          if (url.match(/\.doc/)) {
            // Check file.
            var results = cpr.downloadCheckFile(url);
          }
          else {
            // Check that we don't move outside the domain.
            if (~url.indexOf(domain)) {
              // Queue the url for crawling.
              c.queue(url);
            }
          }
        });
      }
    }
  }
});

// Queue URL given as input parameter.
console.log('Start checking: ' + argv.url);
c.queue(argv.url);
