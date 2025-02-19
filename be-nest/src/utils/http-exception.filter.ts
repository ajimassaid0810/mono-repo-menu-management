import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: AbstractHttpAdapter) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    let errorMessage: unknown;
    let httpStatus: number;
    const httpAdapter = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof PrismaClientRustPanicError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientValidationError) {
      httpStatus = 422;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientInitializationError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (status && status >= 400 && status <= 499) {
      httpStatus = status;
      errorMessage = exception.message;
    } else {
      httpStatus = 500;
      errorMessage = [
        'Sorry! something went to wrong on our service, Please try again later',
      ];
    }

    const errorResponse = {
      statusCode: httpStatus,
      errors:
        typeof errorMessage !== 'string' ? `${errorMessage}` : errorMessage,
    };
    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
