import { HttpError } from "../utils/httpErrors.js";
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: "Something went wrong",
  });
}

export default errorHandler;
