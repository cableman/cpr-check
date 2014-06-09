/**
 * @file
 * Find CPR numbers in strings and files.
 */

var util = require('util');
var Base = require('./base');

// Load libraries to handle files.
var tika = require('tika');
var request = require('request');
var fs = require('fs');
var tmp = require('tmp');

/**
 * Screen object as the module pattern.
 */
var CPR = (function() {

  /**
   * Default constructor.
   */
  var CPR = function() {
    // Regular expresion to find CPR number patterns in the documents.
    this.regex = new RegExp('(?:\\D|^)(\\d{6}-?\\d{4})(?!\\d)', 'gm');

    // Store results.
    this.results = [];
  }

  // Extend the object with event emitter.
  util.inherits(CPR, Base);

  /**
   * CPR modulus 11 calculation.
   */
  CPR.prototype._mod11 = function _mod11(value) {
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

  /**
   * Check that the first 4 numbers are a valided date.
   */
  CPR.prototype._dateCheck = function _dateCheck(value) {
    var day = value.substring(0, 2);
    var month = value.substring(2, 4);
    if (day < 32 && month < 12 && day > 0 && month > 0) {
      return true;
    }
    return false;
  }

  /**
   * Print the objects results to screen.
   */
  CPR.prototype.printResults = function printResults() {
    var self = this;
    var len = self.results.length;
    for (var i = 0; i < len; i++) {
      var result = self.results[i];
      var msg;
      switch (result.status) {
        case 1:
          msg = 'Positive match with modulus 11 (' + result.cpr + ') at: ' + result.uri;
          break;

        case 2:
          msg = 'Posible match (' + result.cpr + ') at: ' + result.uri;
          break;
      }
      console.log(msg);
    }
  }

  /**
   * Checks string for CPR numbers.
   *
   * @param string str
   *   The string needs to be human readable.
   *
   * @return array
   *   The found CPR number in an array of objects.
   *
   *   [{
   *      "status": 1,
   *      "cpr": 0707614285,
   *      "uri": http://...
   *   }]
   *
   *   The status can either be 1 (modulues 11 checked) or 2 (
   *   date and year check), which give a posible match.
   */
  CPR.prototype.checkString = function checkString(str, uri) {
    var self = this;
    var match;
    while (match = self.regex.exec(str)) {
      var number = match[1].replace('-', '');

      // Check the number with modulus 11 check.
      if (self._dateCheck(number)) {
        if (self._mod11(number)) {
          self.results.push({
            "status": 1,
            "cpr": number,
            "uri": uri
          });
        }
        else {
          // At now there is around 18 CPR's that will fail modulus 11
          // see https://cpr.dk/media/167692/personnummeret%20i%20cpr.pdf.
          // - Pr. 11. januar 2011 er der i alt tildelt 18 personnumre uden
          // - modulus 11 - alle til mænd født den 1. januar 1965 eller den
          // - 1. januar 1966.
          if (number.charAt(4) == 6) {
            self.results.push({
              "status": 2,
              "cpr": number,
              "uri": uri
            });
          }
        }
      }
    }
  }

  /**
   * Download and check file.
   */
  CPR.prototype.downloadCheckFile = function downloadCheckFile(uri) {
    var self = this;

    // Generate tmp filename.
    tmp.tmpName(function _tempNameGenerated(err, filename) {
      if (err) {
        throw err;
      }

      // Download file.
      var r = request(uri).pipe(fs.createWriteStream(filename));
      r.on('close', function () {
        // Parse file with tika.
        tika.text(filename, function(err, text) {
          if (err) {
            throw err;
          }

          // Check for CPR in parsed content.
          self.checkString(text, (uri || 'No uri'));
          self.emit('scanned');
        });
      });
    });
  }

  return CPR;
})();

// Export the object.
module.exports = CPR;