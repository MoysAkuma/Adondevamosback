// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  
  res.status(status).json({ 
    error: { 
      message, 
      details 
    } 
  });
};

module.exports = errorHandler;