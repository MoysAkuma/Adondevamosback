class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  success(message, data, statusCode = 200) {
    this.res.status(statusCode).json({
      message:message,
      info:data
    });
  }

  successNoData(statusCode = 200) {
    this.res.status(statusCode).send();
  }
}

export { ApiResponse };