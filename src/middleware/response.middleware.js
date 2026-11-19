import { ApiResponse } from '../utils/apiResponse.js';

const responseMiddleware = (req, res, next) => {
  const apiResponse = new ApiResponse(res);

  res.success = (message, data, statusCode = 200, pagination = null) =>
    apiResponse.success(message, data, statusCode, pagination);

  res.successNoData = (statusCode = 200) => apiResponse.successNoData(statusCode);

  next();
};

export default responseMiddleware;
