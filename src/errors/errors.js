export class AuthorizationError extends Error {
  constructor(message = 'User not authorized to perform this action') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403; // Forbidden
  }
}

export class AuthenticationError extends Error {
    constructor(message = 'User is not authenticated') {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401
    }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404; // Not Found
  }
}

export class BadRequestError extends Error {
  constructor(message = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400; // Bad Request
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict occurred') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409; // Conflict
  }
}

export class InternalServerError extends Error {
  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500; // Internal Server Error
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = 'Service is temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
    this.statusCode = 503; // Service Unavailable
  }
}

export class DatabaseError extends Error {
  constructor(message = 'Database error occurred') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500; // Internal Server Error
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
    this.statusCode = 408; // Request Timeout
  }
}

export class UnsupportedMediaTypeError extends Error {
  constructor(message = 'Unsupported media type') {
    super(message);
    this.name = 'UnsupportedMediaTypeError';
    this.statusCode = 415; // Unsupported Media Type
  }
}

export class ForbiddenOperationError extends Error {
  constructor(message = 'Operation forbidden') {
    super(message);
    this.name = 'ForbiddenOperationError';
    this.statusCode = 403; // Forbidden
  }
}
