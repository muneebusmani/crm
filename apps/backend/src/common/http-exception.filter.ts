import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  errorCode?: string;
  message: string;
  timestamp: string;
}

/**
 * Global HTTP exception filter that formats error responses consistently
 * and includes custom errorCode for frontend handling.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    console.log('[HttpExceptionFilter] Caught exception:', {
      name: exception.name,
      status,
      response: exceptionResponse,
    });

    let errorCode: string | undefined;
    let message: string;

    // Handle different response formats from HttpException
    if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as Record<string, unknown>;

      // Extract errorCode (might be nested or direct)
      errorCode = (resp.errorCode as string) || undefined;

      // Extract message
      if (typeof resp.message === 'string') {
        message = resp.message;
      } else if (Array.isArray(resp.message)) {
        message = resp.message.join(', ');
      } else if (typeof resp.error === 'string') {
        message = resp.error;
      } else {
        message = 'An error occurred';
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      message = 'An error occurred';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(`HTTP ${status} - ${errorCode || 'NO_CODE'}: ${message}`);

    response.status(status).json(errorResponse);
  }
}
