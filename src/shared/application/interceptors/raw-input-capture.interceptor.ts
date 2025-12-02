import {

  Injectable,

  NestInterceptor,

  ExecutionContext,

  CallHandler,

} from '@nestjs/common';

import { Observable } from 'rxjs';

import { Request } from 'express';

 

// Symbol để lưu raw input vào request

export const RAW_INPUT_SYMBOL = Symbol('RAW_INPUT');

 

/**

 * Interceptor để capture giá trị gốc của query/body trước khi transform

 * Lưu vào request[RAW_INPUT_SYMBOL] để dùng trong validation error formatting

 */

@Injectable()

export class RawInputCaptureInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const request = context.switchToHttp().getRequest<Request>();

 

    // Clone raw input trước khi transform

    const rawInput: any = {

      query: { ...request.query },

      body: request.body ? JSON.parse(JSON.stringify(request.body)) : {},

      params: { ...request.params },

    };

    // Lưu vào request để dùng sau

    (request as any)[RAW_INPUT_SYMBOL] = rawInput;

 

    return next.handle();

  }

}