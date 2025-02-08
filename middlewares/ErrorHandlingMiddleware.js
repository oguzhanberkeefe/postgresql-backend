const CustomError = require('../helpers/CustomErrorHelper');
const ErrorTypes = require('../helpers/ErrorTypesHelper');
const { ValidationError } = require('sequelize');

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let errorType = ErrorTypes.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || 'An unexpected error occurred';
  let errorData = null;

  if (err instanceof ValidationError) {
    statusCode = 400;
    errorType = ErrorTypes.VALIDATION_ERROR;
    errorMessage = 'Validation Error';
    errorData = err.errors?.map((e) => ({
      field: e.path,
      message: e.message,
      type: e.type
    }));
  }

  if (err instanceof CustomError) {
    statusCode = err.statusCode || statusCode;
    errorMessage = err.message || errorMessage;
    if (err.details) {
      errorData = err.details;
    }
  }

  if (statusCode === 404) {
    errorType = ErrorTypes.NOT_FOUND;
    if (!errorMessage || errorMessage === 'Not Found') {
      errorMessage = 'Route Not Found';
    }
  }
  return res.status(statusCode).json({
    status: 'error',
    message: errorType,
    data: {
      errorMessage,
      errorDetails: errorData
    }
  });
};
