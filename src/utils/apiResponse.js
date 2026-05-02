class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  success(message, data, statusCode = 200, pagination = null) {
    const response = {
      message: message,
      info: data
    };
    
    if (pagination) {
      response.pagination = pagination;
    }
    
    this.res.status(statusCode).json(response);
  }

  successNoData(statusCode = 200) {
    this.res.status(statusCode).send();
  }
}

export { ApiResponse };