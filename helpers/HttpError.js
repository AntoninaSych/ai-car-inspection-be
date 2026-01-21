import ErrorCodes from "./errorCodes.js";

/**
 * Creates an HTTP error with status, message, and optional error code.
 * @param {number} status - HTTP status code
 * @param {string} message - Error message (for logging/debugging)
 * @param {string} [internalCode] - Internal error code for frontend translation (from ErrorCodes)
 * @returns {Error} Error object with status, message, and internalCode properties
 */
const HttpError = (status, message, internalCode = null) => {
    const error = new Error(message);
    error.status = status;
    error.internalCode = internalCode || getDefaultCode(status);
    return error;
};

/**
 * Returns a default error code based on HTTP status
 * @param {number} status - HTTP status code
 * @returns {string} Default error code
 */
const getDefaultCode = (status) => {
    switch (status) {
        case 400:
            return ErrorCodes.VALIDATION_FAILED;
        case 401:
            return ErrorCodes.AUTH_NOT_AUTHORIZED;
        case 403:
            return ErrorCodes.RESOURCE_ACCESS_DENIED;
        case 404:
            return ErrorCodes.RESOURCE_NOT_FOUND;
        case 409:
            return ErrorCodes.VALIDATION_FAILED;
        case 429:
            return ErrorCodes.RATE_LIMIT_EXCEEDED;
        default:
            return ErrorCodes.SERVER_ERROR;
    }
};

export default HttpError;
