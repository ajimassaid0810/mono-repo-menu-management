import {
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Response } from 'express';
import { CustomError } from './customError';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Tetapkan nilai default untuk httpStatus dan errorMessage
    let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string | string[] =
      'Sorry! Something went wrong on our service. Please try again later.';

    // Jika exception adalah instance dari HttpException, ambil statusnya
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        errorMessage = (exceptionResponse as any).message || errorMessage;
      }
    } 
    // Jika exception adalah CustomError
    else if (exception instanceof CustomError) {
      httpStatus = exception.statusCode || HttpStatus.BAD_REQUEST;
      errorMessage = exception.message;
    } 
    // Jika exception adalah BadRequestException
    else if (exception instanceof BadRequestException) {
      const validationErrors = exception.getResponse() as any;
      httpStatus = HttpStatus.BAD_REQUEST;
      errorMessage = validationErrors?.message || 'Bad request';
    } 
    // Jika error berasal dari Prisma
    else if (exception instanceof PrismaClientRustPanicError) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Database error: Rust panic occurred';
    } else if (exception instanceof PrismaClientValidationError) {
      httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientInitializationError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      errorMessage = exception.message;
    }

    // Format response
    const errorResponse = {
      statusCode: httpStatus,
      errors: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
      timestamp: new Date().toISOString(),
    };

    response.status(httpStatus).json(errorResponse);
  }
}
