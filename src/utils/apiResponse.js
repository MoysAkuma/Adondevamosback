class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  success(message, data, statusCode = 200) {
    this.res.status(statusCode).json({
      success: true,
      message:message,
      info:data
    });
  }
}

export { ApiResponse };