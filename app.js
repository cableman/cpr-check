#!/usr/bin/env node

/**
 * @file
 * Prototype web-crawler that checks pages for CPR numbers.
 */

var Crawler = require("crawler").Crawler;
var argv = require('optimist').argv;
var domain = argv.domain;

/**
 * CPR modulus 11 calculation.
 */
var mod11 = function(value) {
  var numbers = value.split('');
  var factors = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  var res = 0;
  for (var i = 0; i < 9; i++) {
    res = res + (numbers[i] * factors[i]);
  }

  var check_value = 11 - (res % 11);
  if (numbers[9] == check_value) {
    return true;
  }
  return false;
}

var c = new Crawler({
  "maxConnections": 1,
  "cache": true,
  "skipDuplicates": true,

  // This will be called for each crawled page
  "callback": function(error, result, $) {
    if (result.body !== undefined) {
      // Get body.
      var body = result.body;

      // Lookup numbers that may match CPR in the body.
      // Fix lookbehind: ((?<!\d)(\d{10})(?!\d))|(\d{6}-\d{4})
      var matches = body.match(/((\d{10})(?!\d))|(\d{6}-\d{4})/gi);
      if (matches) {
        // Loop over the matches.
        var len = matches.length;
        for (var i = 0; i < len; i++) {
          var match = matches[i].replace('-', '');

          // Check the number with modulus 11 check.
          if (mod11(match)) {
            console.log('Positive CPR match found at: "' + (result.options.uri || 'HTML') + '" (' + match + ')');
          }
          else {
            // At now there is around 18 CPR's that will fail modulus 11
            // see https://cpr.dk/media/167692/personnummeret%20i%20cpr.pdf.
            // - Pr. 11. januar 2011 er der i alt tildelt 18 personnumre uden
            // - modulus 11 - alle til mænd født den 1. januar 1965 eller den
            // - 1. januar 1966.
            if (match.charAt(4) == 6) {
              console.log('Posible CPR found at: "' + (result.options.uri || 'HTML') + '" (' + match + ')');
            }
          }
        }
      }

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
