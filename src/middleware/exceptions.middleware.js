import { ApiError } from '../utils/apiError.js';

const exceptions = {
  badRequest: (message = 'Bad request', errors = []) => new ApiError(400, message, errors),
  unauthorized: (message = 'Unauthorized') => new ApiError(401, message),
  forbidden: (message = 'Forbidden') => new ApiError(403, message),
  notFound: (message = 'Resource not found') => new ApiError(404, message),
  conflict: (message = 'Conflict') => new ApiError(409, message),
  internal: (message = 'Internal Server Error') => new ApiError(500, message)
};

export default exceptions;
