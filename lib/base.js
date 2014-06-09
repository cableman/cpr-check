/**
 * @file
 * Defined base/super object used by the other library objects to inherit
 * basic methods.
 */

var util = require('util');
var eventEmitter = require('events').EventEmitter;

/**
 * Base object as the module pattern.
 */
var Base = (function() {

  /**
   * Define the Base object.
   */
  var Base = function() { }

  // Extend the object with event emitter.
  util.inherits(Base, eventEmitter);

  /**
   * Emit error message.
   *
   * @private
   */
  Base.prototype.error = function error(code, message) {
    this.emit('error', { code: code, message: message });
  }

  /**
   * Generic get function to extract properties.
   */
  Base.prototype.get = function get(property) {
    var self = this;

    if (self.hasOwnProperty(property)) {
      return self[property];
    }

    self.error(500, 'Get - Property is not defined (' + property + ')');
  }

  /**
   * Generic set function to set properties.
   */
  Base.prototype.set = function set(property, value) {
    var self = this;

    if (self.hasOwnProperty(property)) {
      self[property] = value;
    }
    else {
      self.error(500, 'Set - Property is not defined (' + property + ')');
    }
  }

  // Return the inner object.
  return Base;

})();

// Export the object.
module.exports = Base;
