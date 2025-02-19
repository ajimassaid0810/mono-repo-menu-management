import {
  Injectable,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { MyResponse } from './response.interface';

@Injectable()
export class ErrorHandlingService {
  handleStatusCode(error: any) {
    const statusCode = error.statusCode || error.code;
    const message = error.message;

    const response: MyResponse = {
      meta: {
        code: error.statusCode ? error.statusCode : error.code,
        message: error.message,
        status: 'Gagal',
      },
    };

    if (statusCode === 404 || statusCode === 'ERR_BAD_REQUEST') {
      throw new NotFoundException(response);
    }

    if (statusCode === 403) {
      throw new ForbiddenException(response);
    }

    if (statusCode === 400) {
      throw new BadRequestException(response);
    }

    if (statusCode === 'EAUTH') {
      throw new AuthenticationException(message);
    }

    // Default fallback error
    throw new HttpException(response, statusCode);
  }
}

export class AuthenticationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED, // Status code 401 (Unauthorized)
        message, // Pesan yang diteruskan sebagai argumen
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
