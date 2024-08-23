const ApiError = require("../exceptions/apiError");

module.exports = function (err, req, res, next) {
  console.log(err);

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .send({ message: err.message, errors: err.errors });
  }

  return res
    .status(500)
    .send({ message: `Произошла непредвиденная ошибка ${err.message}` });
};
