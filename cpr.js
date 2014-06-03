/**
 * @file
 * Find CPR numbers in strings.
 */


// Regular expresion to find CPR number patterns in the documents.
var regex = new RegExp('(?:\\D|^)(\\d{6}-?\\d{4})(?!\\d)', 'gm');

/**
 * CPR modulus 11 calculation.
 */
var mod11 = function mod11(value) {
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
exports.mod11 = mod11;

/**
 * Check that the first 4 numbers are a valided date.
 */
var dateCheck = function dateCheck(value) {
  var day = value.substring(0, 2);
  var month = value.substring(2, 4);
  if (day < 32 && month < 12 && day > 0 && month > 0) {
    return true;
  }
  return false;
}
exports.dateCheck = dateCheck;

/**
 * Hepler functio to print result from checkString.
 *
 * @param array results
 *   For information about the format see checkString.
 */
exports.printResult = function printResult(results) {
  if (results instanceof Array) {
    var len = results.length;
    for (var i = 0; i < len; i++) {
      var result = results[i];
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
exports.checkString = function checkString(str, uri) {
  var cprs = [];
  var match;
  while (match = regex.exec(str)) {
    var number = match[1].replace('-', '');

    // Check the number with modulus 11 check.
    if (dateCheck(number)) {
      if (mod11(number)) {
        cprs.push({
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
          cprs.push({
            "status": 2,
            "cpr": number,
            "uri": uri
          });
        }
      }
    }
  }

  return cprs;
}
