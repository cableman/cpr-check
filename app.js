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

// Load configuration.
var config = require('nconf');
config.file({ file: 'config.json' });

// Build extensions regex.
var extensions = config.get('tika').extensions;
var len = extensions.length;
var regex_str = '';
for (var i = 0; i < len; i++) {
  regex_str += '\\.' + extensions[i] + '$|';
}
regex_str = regex_str.substring(0, regex_str.length - 1);
var regex_ext = new RegExp(regex_str, 'g');

// @todo: fix pdf encodeing of "-" -> 070761-­‐4285

// Load CPR check library.
var CPR = require('./lib/cpr');

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
          if (regex_ext.test(url)) {
            console.log(url);
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
