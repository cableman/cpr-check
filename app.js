#!/usr/bin/env node

/**
 * @file
 * Prototype web-crawler that checks pages for CPR numbers.
 */

// Add web-crawler.
var Crawler = require("crawler").Crawler;

// Get parameters.
var argv = require('optimist').argv;
var domain = argv.domain;

// Load CPR check library.
var CPR = require('./lib/cpr');

var files = [ 'pdf', 'docx', 'doc'];

var c = new Crawler({
  "maxConnections": 1,
  "cache": true,
  "skipDuplicates": true,

  // This will be called for each crawled page
  "callback": function(error, result, $) {
    if (result.body !== undefined) {
      var cpr = new CPR();

      // Check body.
      cpr.checkString(result.body, (result.options.uri || 'No uri'));
      cpr.printResults();

      // $ is a jQuery instance scoped to the server-side DOM of the page
      if ($) {
        $('a').each(function(index, a) {
          var url = a.href;

          // Check if URL has a known file extension.
          if (url.match(/\.doc/)) {
            // Check file.
            cpr.downloadCheckFile(url);
            cpr.on('scanned', function() {
              cpr.printResults();
            });
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
