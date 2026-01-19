import { Inject, Injectable, InjectionToken, Injector, Optional } from '@angular/core';
import { HttpClient, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ErrorHandlerInterceptor } from './error-handler.interceptor';
import { CacheInterceptor } from './cache.interceptor';

// HttpClient is declared in a re-exported module, so we have to extend the original module to make it work properly
// (see https://github.com/Microsoft/TypeScript/issues/13897)
declare module '@angular/common/http' {

  // Augment HttpClient with the configuration methods from HttpService for convenience,
  // allowing to inject HttpService in place of HttpClient and still use the extension methods
  export interface HttpClient {
    cache(forceUpdate?: boolean): HttpClient;
    skipErrorHandler(): HttpClient;
  }

}

/**
 * Allow to override default interceptors that can be disabled with the HttpService extension.
 * Except for very specific needs, you should better configure these interceptors directly in the constructor below
 * for better readability.
 */
export const HTTP_DYNAMIC_INTERCEPTORS = new InjectionToken<HttpInterceptor>('HTTP_DYNAMIC_INTERCEPTORS');

/**
 * Provides a base for HTTP client extension.
 * The default extension adds support for API prefixing, request caching and default error handler.
 */
@Injectable()
export class HttpService extends HttpClient {

  constructor(private httpHandler: HttpHandler,
    private injector: Injector,
    @Optional() @Inject(HTTP_DYNAMIC_INTERCEPTORS) private interceptors: HttpInterceptor[] | null) {
    super(httpHandler);

    if (!this.interceptors) {
      // Configure default interceptors that can be disabled here
      this.interceptors = [this.injector.get(ErrorHandlerInterceptor)];
    }
  }

  /**
   * Enables caching for this request.
   * @param {boolean} forceUpdate Forces request to be made and updates cache entry.
   * @return {HttpClient} The new instance.
   */
  override cache(forceUpdate?: boolean): HttpClient {
    const cacheInterceptor = this.injector.get(CacheInterceptor).configure({ update: forceUpdate });
    return this.addInterceptor(cacheInterceptor);
  }

  /**
   * Skips default error handler for this request.
   * @return {HttpClient} The new instance.
   */
  override skipErrorHandler(): HttpClient {
    return this.removeInterceptor(ErrorHandlerInterceptor);
  }

  /**
   * Wires the interceptors when triggering the requests.
   */
  override request(method?: any, url?: any, options?: any): any {
    const handler = (this.interceptors || []).reduceRight(
      (next, interceptor) => new HttpInterceptorHandler(next, interceptor),
      this.httpHandler
    );
    return new HttpClient(handler).request(method, url, options);
  }

  private removeInterceptor(interceptorType: Function): HttpService {
    return new HttpService(
      this.httpHandler,
      this.injector,
      (this.interceptors || []).filter(i => !(i instanceof interceptorType))
    );
  }

  private addInterceptor(interceptor: HttpInterceptor): HttpService {
    return new HttpService(
      this.httpHandler,
      this.injector,
      (this.interceptors || []).concat([interceptor])
    );
  }

}

class HttpInterceptorHandler implements HttpHandler {

  constructor(private next: HttpHandler, private interceptor: HttpInterceptor) {
  }

  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return this.interceptor.intercept(request, this.next);
  }

}