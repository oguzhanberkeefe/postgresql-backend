
class CustomError extends Error {
    /**
     * @param {string} message
     * @param {number} statusCode
     * @param {any} details
     */
    constructor(message, statusCode = 500, details = null) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = CustomError;
  