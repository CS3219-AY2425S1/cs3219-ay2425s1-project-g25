class HttpError extends Error {
  constructor(message = "An error occurred", statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = statusCode;
  }
}

class UnauthorisedError extends HttpError {
  constructor(message = "Unauthorised") {
    super(message, 401);
  }
}

class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

class BadRequestError extends HttpError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

class ConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export { HttpError, UnauthorisedError, ForbiddenError, NotFoundError, BadRequestError, ConflictError };
