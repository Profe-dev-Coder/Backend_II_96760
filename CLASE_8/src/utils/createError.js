const createError = (message, statusCode = 500) => {
  
  return {
    message,
    statusCode
  };
};

export default createError