import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface PostgresError extends Error {
  code?: string;
}

@Catch(QueryFailedError)
export class TypeormExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const driverError = exception.driverError as PostgresError;
    const code = driverError?.code;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    switch (code) {
      case '23505': // unique_violation
        status = HttpStatus.CONFLICT;
        message = 'Record with this data already exists';
        error = 'Conflict';
        break;
      case '23503': // foreign_key_violation
        status = HttpStatus.CONFLICT;
        message = 'Related record does not exist';
        error = 'Conflict';
        break;
      case '23502': // not_null_violation
      case '23514': // check_violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid data provided';
        error = 'Bad Request';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
